import Link from "next/link";
import { cn } from "@/lib/cn";
import { JsonLd } from "./JsonLd";
import { breadcrumbSchema, graph } from "@/lib/structured-data";

type Crumb = { name: string; path: string };

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("type-meta", className)}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="font-medium">
                    {c.name}
                  </span>
                ) : (
                  <>
                    <Link href={c.path} className="underline decoration-current/30 underline-offset-4 hover:decoration-current">
                      {c.name}
                    </Link>
                    <span aria-hidden className="opacity-40">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={graph(breadcrumbSchema(all))} />
    </>
  );
}
