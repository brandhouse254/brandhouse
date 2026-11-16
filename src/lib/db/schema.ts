/**
 * Tables for the business side of the admin. Every statement is safe to run
 * again, so the schema is created (or upgraded with new columns) automatically.
 */
export function SCHEMA_SQL(s: string): string[] {
  return [
    `CREATE SCHEMA IF NOT EXISTS ${s}`,

    `CREATE TABLE IF NOT EXISTS ${s}.settings (
      key text PRIMARY KEY,
      value jsonb NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.counters (
      name text PRIMARY KEY,
      value integer NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.clients (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      company text NOT NULL DEFAULT '',
      email text NOT NULL DEFAULT '',
      phone text NOT NULL DEFAULT '',
      kra_pin text NOT NULL DEFAULT '',
      address text NOT NULL DEFAULT '',
      notes text NOT NULL DEFAULT '',
      archived boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.leads (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      source text NOT NULL DEFAULT 'website',
      name text NOT NULL,
      organisation text NOT NULL DEFAULT '',
      email text NOT NULL DEFAULT '',
      phone text NOT NULL DEFAULT '',
      services jsonb NOT NULL DEFAULT '[]',
      budget text NOT NULL DEFAULT '',
      timeline text NOT NULL DEFAULT '',
      referral text NOT NULL DEFAULT '',
      description text NOT NULL DEFAULT '',
      stage text NOT NULL DEFAULT 'new',
      assignee_id text,
      follow_up_on date,
      value numeric(14,2),
      read boolean NOT NULL DEFAULT false,
      client_id uuid REFERENCES ${s}.clients(id) ON DELETE SET NULL,
      project_id uuid,
      legacy_id text UNIQUE,
      received_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.lead_notes (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id uuid NOT NULL REFERENCES ${s}.leads(id) ON DELETE CASCADE,
      user_id text NOT NULL,
      user_name text NOT NULL DEFAULT '',
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.projects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      client_id uuid REFERENCES ${s}.clients(id) ON DELETE SET NULL,
      lead_id uuid REFERENCES ${s}.leads(id) ON DELETE SET NULL,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'active',
      start_on date,
      due_on date,
      budget numeric(14,2),
      created_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.tasks (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id uuid REFERENCES ${s}.projects(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text NOT NULL DEFAULT '',
      status text NOT NULL DEFAULT 'todo',
      priority text NOT NULL DEFAULT 'normal',
      assignee_id text,
      due_on date,
      position double precision NOT NULL DEFAULT 0,
      created_by text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      completed_at timestamptz
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.task_comments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id uuid NOT NULL REFERENCES ${s}.tasks(id) ON DELETE CASCADE,
      user_id text NOT NULL,
      user_name text NOT NULL DEFAULT '',
      body text NOT NULL DEFAULT '',
      attachments jsonb NOT NULL DEFAULT '[]',
      created_at timestamptz NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.invoices (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      kind text NOT NULL DEFAULT 'invoice',
      number text NOT NULL UNIQUE,
      client_id uuid REFERENCES ${s}.clients(id) ON DELETE SET NULL,
      project_id uuid REFERENCES ${s}.projects(id) ON DELETE SET NULL,
      issue_on date NOT NULL DEFAULT CURRENT_DATE,
      due_on date,
      status text NOT NULL DEFAULT 'draft',
      vat_rate numeric(5,2) NOT NULL DEFAULT 16,
      vat_inclusive boolean NOT NULL DEFAULT false,
      discount numeric(14,2) NOT NULL DEFAULT 0,
      notes text NOT NULL DEFAULT '',
      terms text NOT NULL DEFAULT '',
      share_token text NOT NULL UNIQUE,
      converted_from uuid,
      created_by text,
      created_at timestamptz NOT NULL DEFAULT now(),
      sent_at timestamptz
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.invoice_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id uuid NOT NULL REFERENCES ${s}.invoices(id) ON DELETE CASCADE,
      description text NOT NULL DEFAULT '',
      quantity numeric(12,2) NOT NULL DEFAULT 1,
      unit_price numeric(14,2) NOT NULL DEFAULT 0,
      position integer NOT NULL DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.payments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      invoice_id uuid NOT NULL REFERENCES ${s}.invoices(id) ON DELETE CASCADE,
      paid_on date NOT NULL DEFAULT CURRENT_DATE,
      amount numeric(14,2) NOT NULL,
      method text NOT NULL DEFAULT 'mpesa',
      reference text NOT NULL DEFAULT '',
      note text NOT NULL DEFAULT '',
      created_at timestamptz NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS ${s}.expenses (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      spent_on date NOT NULL DEFAULT CURRENT_DATE,
      category text NOT NULL DEFAULT 'Other',
      vendor text NOT NULL DEFAULT '',
      description text NOT NULL DEFAULT '',
      amount numeric(14,2) NOT NULL,
      vat numeric(14,2) NOT NULL DEFAULT 0,
      method text NOT NULL DEFAULT 'mpesa',
      reference text NOT NULL DEFAULT '',
      receipt_url text NOT NULL DEFAULT '',
      project_id uuid REFERENCES ${s}.projects(id) ON DELETE SET NULL,
      created_by text,
      created_at timestamptz NOT NULL DEFAULT now()
    )`,

    `CREATE INDEX IF NOT EXISTS leads_stage_idx ON ${s}.leads(stage)`,
    `CREATE INDEX IF NOT EXISTS tasks_assignee_idx ON ${s}.tasks(assignee_id, status)`,
    `CREATE INDEX IF NOT EXISTS tasks_project_idx ON ${s}.tasks(project_id)`,
    `CREATE INDEX IF NOT EXISTS invoices_client_idx ON ${s}.invoices(client_id)`,
    `CREATE INDEX IF NOT EXISTS payments_invoice_idx ON ${s}.payments(invoice_id)`,
    `CREATE INDEX IF NOT EXISTS expenses_date_idx ON ${s}.expenses(spent_on)`,
  ];
}
