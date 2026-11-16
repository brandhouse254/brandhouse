"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { workCategories, workCategoryLabels, type Service } from "@/lib/cms/types";
import { EditorBar, useSectionEditor } from "../editor";
import { ImageField } from "../media";
import { Button, Card, EmptyState, Grid, IconButton, Repeater, Select, StringList, TextArea, TextField } from "../ui";
import { slugify } from "./work";

const renumber = (list: Service[]) => list.map((s, i) => ({ ...s, number: String(i + 1).padStart(2, "0") }));

function blankService(position: number): Service {
  return {
    slug: "",
    number: String(position).padStart(2, "0"),
    title: "",
    summary: "",
    headline: "",
    intro: "",
    capabilities: [],
    deliverables: [],
    projectTypes: [],
    value: [],
    processNotes: ["", "", "", ""],
    workCategory: "branding",
    image: { src: "", alt: "" },
    aboutNote: "",
    meta: { title: "", description: "" },
  };
}

export function ServicesList({ initial }: { initial: Service[] }) {
  const ed = useSectionEditor("services", initial);
  const items = ed.value;
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [x] = next.splice(from, 1);
    next.splice(to, 0, x);
    ed.setValue(renumber(next));
  };
  return (
    <>
      <EditorBar
        title="Services"
        description="Your divisions. Each one has its own page, appears on the homepage, in the footer and in the enquiry form."
        editor={ed}
        viewHref="/services"
        extra={
          <Link href="/admin/services/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-ink hover:bg-accent-deep hover:text-white">
            <Plus className="size-4" /> New service
          </Link>
        }
      />
      {items.length === 0 ? (
        <EmptyState title="No services" body="Add at least one service." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((s, i) => (
            <li key={`${s.slug}-${i}`} className="overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
              <div className="relative aspect-[16/7] bg-paper">
                {s.image.src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image.src} alt="" className="size-full object-cover" />
                ) : null}
                <span className="absolute left-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-display text-xs tabular-nums text-white">{s.number}</span>
              </div>
              <div className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/services/${s.slug}`} className="font-display text-lg font-semibold hover:underline">
                    {s.title || "Untitled service"}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-mute-2">{s.summary}</p>
                </div>
                <div className="flex shrink-0">
                  <IconButton label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                    <ArrowUp className="size-4" />
                  </IconButton>
                  <IconButton label="Move down" disabled={i === items.length - 1} onClick={() => move(i, i + 1)}>
                    <ArrowDown className="size-4" />
                  </IconButton>
                  <Link href={`/admin/services/${s.slug}`} aria-label="Edit" title="Edit" className="inline-flex size-8 items-center justify-center rounded-full text-ink/55 hover:bg-ink/6 hover:text-ink">
                    <Pencil className="size-4" />
                  </Link>
                  <IconButton
                    label="Delete"
                    className="hover:text-red-600"
                    disabled={items.length === 1}
                    onClick={() => {
                      if (confirm(`Delete the "${s.title}" service and its page? You can undo this from Version history.`)) {
                        ed.setValue(renumber(items.filter((_, j) => j !== i)));
                      }
                    }}
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function ServiceEditor({ services, slug }: { services: Service[]; slug: string | null }) {
  const router = useRouter();
  const isNew = slug === null;
  const [initial] = useState(() => (isNew ? [...services, blankService(services.length + 1)] : services));
  const [index] = useState(() => (isNew ? services.length : services.findIndex((s) => s.slug === slug)));
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const deleting = useRef(false);
  const ed = useSectionEditor("services", initial, {
    onSaved: (stored) => {
      if (deleting.current) return;
      const saved = stored[index];
      if (saved && (isNew || saved.slug !== slug)) router.replace(`/admin/services/${saved.slug}`);
    },
  });
  const s = ed.value[index];
  if (!s) {
    return <EmptyState title="Service not found" action={<Link href="/admin/services" className="underline">Back to services</Link>} />;
  }
  const set = (patch: Partial<Service>) => ed.setValue(ed.value.map((x, i) => (i === index ? { ...x, ...patch } : x)));

  const remove = async () => {
    if (isNew) return router.push("/admin/services");
    if (ed.value.length === 1) return alert("Keep at least one service.");
    if (!confirm(`Delete "${s.title}" and its page? You can undo this from Version history.`)) return;
    deleting.current = true;
    if (await ed.save(renumber(ed.value.filter((_, i) => i !== index)))) router.push("/admin/services");
    else deleting.current = false;
  };

  const stageNames = ["Discover", "Strategise", "Create", "Launch & optimise"];

  return (
    <>
      <EditorBar
        title={isNew ? "New service" : s.title || "Untitled service"}
        description={
          <Link href="/admin/services" className="hover:underline">
            ← All services
          </Link>
        }
        editor={ed}
        viewHref={isNew ? undefined : `/services/${s.slug}`}
        extra={
          <Button variant="ghost" onClick={remove} className="text-red-700 hover:bg-red-50">
            <Trash2 className="size-4" /> <span className="hidden sm:inline">Delete</span>
          </Button>
        }
      />
      <div className="space-y-6">
        <Card title="Basics">
          <Grid>
            <TextField
              label="Service name"
              value={s.title}
              onChange={(title) => set({ title, ...(slugTouched ? {} : { slug: slugify(title) }) })}
              max={80}
            />
            <TextField
              label="Web address"
              prefix="/services/"
              value={s.slug}
              onChange={(v) => {
                setSlugTouched(true);
                set({ slug: slugify(v) });
              }}
            />
          </Grid>
          <TextArea label="Summary" value={s.summary} onChange={(summary) => set({ summary })} max={400} hint="One line used on the homepage and in lists." />
          <Grid>
            <Select
              label="Work category"
              value={s.workCategory}
              onChange={(workCategory) => set({ workCategory })}
              options={workCategories.map((c) => ({ value: c, label: workCategoryLabels[c] }))}
              hint="Projects in this category show as related work on this service's page."
            />
            <TextField label="About page note" value={s.aboutNote} onChange={(aboutNote) => set({ aboutNote })} max={300} hint="One line on the About page." />
          </Grid>
        </Card>

        <Card title="Service page header">
          <ImageField label="Header image" value={s.image} onChange={(image) => set({ image })} hint="Landscape. Also used on the homepage and the services list." />
          <TextArea label="Headline" value={s.headline} onChange={(headline) => set({ headline })} max={200} />
          <TextArea label="Intro" value={s.intro} onChange={(intro) => set({ intro })} max={1200} rows={4} />
        </Card>

        <Card title="Why it matters" description="Three short benefits, shown in columns.">
          <Repeater
            items={s.value}
            onChange={(value) => set({ value })}
            create={() => ({ title: "", body: "" })}
            itemLabel={(v) => v.title}
            addLabel="Add a benefit"
            max={6}
            render={(v, update) => (
              <>
                <TextField label="Title" value={v.title} onChange={(title) => update({ title })} max={160} />
                <TextArea label="Text" value={v.body} onChange={(body) => update({ body })} max={600} />
              </>
            )}
          />
        </Card>

        <Card title="What's included">
          <StringList label="What we do (capabilities)" value={s.capabilities} onChange={(capabilities) => set({ capabilities })} addLabel="Add a capability" max={16} />
          <StringList label="What you receive (deliverables)" value={s.deliverables} onChange={(deliverables) => set({ deliverables })} addLabel="Add a deliverable" max={16} />
          <StringList label="Typical projects" value={s.projectTypes} onChange={(projectTypes) => set({ projectTypes })} addLabel="Add a project type" max={12} />
        </Card>

        <Card title="How the project runs" description="What happens at each of the four stages for this service.">
          {s.processNotes.map((note, i) => (
            <TextArea
              key={i}
              label={`${String(i + 1).padStart(2, "0")} · ${stageNames[i]}`}
              value={note}
              onChange={(v) => {
                const processNotes = [...s.processNotes] as Service["processNotes"];
                processNotes[i] = v;
                set({ processNotes });
              }}
              max={400}
            />
          ))}
        </Card>

        <Card title="Google search listing">
          <TextField label="Search title" value={s.meta.title} onChange={(title) => set({ meta: { ...s.meta, title } })} max={120} />
          <TextArea label="Search description" value={s.meta.description} onChange={(description) => set({ meta: { ...s.meta, description } })} max={300} />
          <div className="rounded-xl bg-paper/60 p-4 ring-1 ring-ink/8">
            <p className="text-xs text-ink/50">brandhouse.co.ke › services › {s.slug || "…"}</p>
            <p className="mt-1 truncate text-lg text-[#1a0dab]">{s.meta.title || s.title || "Search title"} | Brand House</p>
            <p className="mt-0.5 line-clamp-2 text-sm text-ink/70">{s.meta.description || "Search description"}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
