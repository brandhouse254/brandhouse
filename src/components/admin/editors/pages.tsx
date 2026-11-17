"use client";

import { useState } from "react";
import type { PagesContent } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { EditorBar, useSectionEditor } from "../editor";
import { Card, Repeater, TextArea, TextField } from "../ui";

type Tab = "home" | "work" | "services" | "contact" | "cta";

const tabs: { id: Tab; label: string; view: string; description: string }[] = [
  { id: "home", label: "Homepage headings", view: "/", description: "Headings and intros for the homepage sections. Hero, photo cards and “Why us” are under Homepage." },
  { id: "work", label: "Work page", view: "/work", description: "The top of the /work page." },
  { id: "services", label: "Services page", view: "/services", description: "The top of the /services page. Each service's own text is under Services." },
  { id: "contact", label: "Contact page", view: "/contact", description: "The heading, intro and the “What happens next” steps on /contact." },
  { id: "cta", label: "Call to action", view: "/", description: "The orange “Let’s build…” block at the bottom of most pages." },
];

export function PagesEditor({ initial }: { initial: PagesContent }) {
  const [tab, setTab] = useState<Tab>("home");
  const ed = useSectionEditor("pages", initial);
  const v = ed.value;
  const current = tabs.find((t) => t.id === tab)!;
  const setPart = <K extends keyof PagesContent>(key: K, patch: Partial<PagesContent[K]>) => ed.setValue({ ...v, [key]: { ...v[key], ...patch } });

  return (
    <>
      <EditorBar title="Page text" description={current.description} editor={ed} viewHref={current.view} />
      <div role="tablist" aria-label="Pages" className="mb-6 flex flex-wrap gap-1 rounded-2xl bg-white p-1 ring-1 ring-ink/10 sm:inline-flex sm:rounded-full">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors", tab === t.id ? "bg-ink text-white" : "text-ink/65 hover:text-ink")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" ? (
        <div className="space-y-6">
          <Card title="Featured work" description="The showcase right after the hero. Choose which projects appear by starring them in Portfolio.">
            <TextField label="Heading" value={v.home.workTitle} onChange={(workTitle) => setPart("home", { workTitle })} max={80} />
            <TextArea label="Intro" value={v.home.workLead} onChange={(workLead) => setPart("home", { workLead })} max={400} />
          </Card>
          <Card title="What we make" description="The dark services section. The cards come from Services.">
            <TextField label="Heading" value={v.home.servicesTitle} onChange={(servicesTitle) => setPart("home", { servicesTitle })} max={80} />
            <TextArea label="Intro" value={v.home.servicesLead} onChange={(servicesLead) => setPart("home", { servicesLead })} max={400} />
          </Card>
          <Card title="How we work">
            <TextField label="Heading" value={v.home.processTitle} onChange={(processTitle) => setPart("home", { processTitle })} max={80} />
            <TextArea label="Intro" value={v.home.processLead} onChange={(processLead) => setPart("home", { processLead })} max={400} />
          </Card>
          <Card title="Testimonials">
            <TextField label="Small heading" value={v.home.testimonialsTitle} onChange={(testimonialsTitle) => setPart("home", { testimonialsTitle })} max={80} />
          </Card>
        </div>
      ) : null}

      {tab === "work" ? (
        <Card title="Work page">
          <TextField label="Heading" value={v.work.title} onChange={(title) => setPart("work", { title })} max={120} />
          <TextArea label="Intro" value={v.work.intro} onChange={(intro) => setPart("work", { intro })} max={600} />
        </Card>
      ) : null}

      {tab === "services" ? (
        <Card title="Services page">
          <TextField label="Heading" value={v.services.title} onChange={(title) => setPart("services", { title })} max={160} />
          <TextArea label="Intro" value={v.services.intro} onChange={(intro) => setPart("services", { intro })} max={600} />
        </Card>
      ) : null}

      {tab === "contact" ? (
        <div className="space-y-6">
          <Card title="Contact page">
            <TextField label="Heading" value={v.contact.title} onChange={(title) => setPart("contact", { title })} max={120} />
            <TextArea label="Intro" value={v.contact.intro} onChange={(intro) => setPart("contact", { intro })} max={600} />
          </Card>
          <Card title="What happens next" description="Numbered steps beside the form. Leave empty to hide the panel.">
            <Repeater
              items={v.contact.steps}
              onChange={(steps) => setPart("contact", { steps })}
              create={() => ({ title: "", body: "" })}
              itemLabel={(st, i) => st.title || `Step ${i + 1}`}
              addLabel="Add a step"
              max={5}
              render={(st, update) => (
                <>
                  <TextField label="Title" value={st.title} onChange={(title) => update({ title })} max={160} />
                  <TextArea label="Text" value={st.body} onChange={(body) => update({ body })} max={600} />
                </>
              )}
            />
          </Card>
        </div>
      ) : null}

      {tab === "cta" ? (
        <Card title="Call to action" description="Used on every page that doesn't set its own. The About page has its own under About page.">
          <TextField label="Heading" value={v.cta.title} onChange={(title) => setPart("cta", { title })} max={120} />
          <TextArea label="Text" value={v.cta.body} onChange={(body) => setPart("cta", { body })} max={400} />
          <TextField label="Button text" value={v.cta.buttonLabel} onChange={(buttonLabel) => setPart("cta", { buttonLabel })} max={40} />
        </Card>
      ) : null}
    </>
  );
}
