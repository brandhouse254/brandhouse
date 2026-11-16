import { neon } from "@neondatabase/serverless";
import { SCHEMA_SQL } from "./schema";

/**
 * Postgres for the business side of the admin (leads, clients, projects,
 * tasks, invoices, expenses). Production uses the Neon database connected in
 * Vercel (DATABASE_URL). Previews use a separate schema in the same database,
 * so testing never touches real records. Locally, DATABASE_URL=pglite runs an
 * in-process Postgres for development and tests.
 */

export type Row = Record<string, unknown>;
type Statement = { text: string; params?: unknown[] };

const url = () => process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export const dbConfigured = () => Boolean(url());

/** Schema name: live data and preview/test data never mix. */
export const S = process.env.VERCEL_ENV === "production" ? "bh" : "bh_preview";

type Driver = {
  query: (text: string, params: unknown[]) => Promise<Row[]>;
  transaction: (statements: Statement[]) => Promise<Row[][]>;
};

let driverPromise: Promise<Driver> | null = null;

async function createDriver(): Promise<Driver> {
  const connection = url();
  if (!connection) throw new Error("The database isn't connected yet (DATABASE_URL is missing).");

  if (connection.startsWith("pglite")) {
    // Development and automated tests only.
    const { PGlite } = await import("@electric-sql/pglite");
    const dir = connection.split(":")[1];
    const db = new PGlite(dir || undefined);
    return {
      query: async (text, params) => (await db.query<Row>(text, params)).rows,
      transaction: async (statements) =>
        db.transaction(async (tx) => {
          const out: Row[][] = [];
          for (const s of statements) out.push((await tx.query<Row>(s.text, s.params ?? [])).rows);
          return out;
        }),
    };
  }

  const sql = neon(connection);
  return {
    query: (text, params) => sql.query(text, params) as Promise<Row[]>,
    transaction: (statements) =>
      sql.transaction(statements.map((s) => sql.query(s.text, s.params ?? []))) as unknown as Promise<Row[][]>,
  };
}

let schemaReady: Promise<void> | null = null;

async function driver(): Promise<Driver> {
  driverPromise ??= createDriver();
  const d = await driverPromise;
  // Create or upgrade the tables once per server instance.
  schemaReady ??= (async () => {
    for (const statement of SCHEMA_SQL(S)) await d.query(statement, []);
  })().catch((e) => {
    schemaReady = null;
    throw e;
  });
  await schemaReady;
  return d;
}

/** Run one query. Use $1, $2… placeholders; table names as `${S}.table`. */
export async function q<T = Row>(text: string, params: unknown[] = []): Promise<T[]> {
  return (await (await driver()).query(text, params)) as T[];
}

export async function one<T = Row>(text: string, params: unknown[] = []): Promise<T | null> {
  return (await q<T>(text, params))[0] ?? null;
}

/** Several statements that succeed or fail together. */
export async function tx(statements: Statement[]): Promise<Row[][]> {
  return (await driver()).transaction(statements);
}

/** Postgres numeric comes back as text; money is always shown as numbers. */
export const num = (v: unknown) => (v === null || v === undefined || v === "" ? 0 : Number(v));

/** Dates as YYYY-MM-DD strings (or null), whichever driver returned them. */
export function day(v: unknown): string | null {
  if (!v) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

export function iso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  return v ? new Date(String(v)).toISOString() : new Date(0).toISOString();
}
