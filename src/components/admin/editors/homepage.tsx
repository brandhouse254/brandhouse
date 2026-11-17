"use client";

import { useState } from "react";
import type { DifferenceContent, HeroContent, IntroContent, ReelFrame } from "@/lib/cms/types";
import { cn } from "@/lib/cn";
import { EditorBar, useSectionEditor } from "../editor";
import { ImageField } from "../media";
import { Card, Grid, Repeater, StringList, TextArea, TextField } from "../ui";
import { thumb } from "@/lib/cms/thumb";

type Tab = "hero" | "intro" | "difference";

export function HomepageEditor({ hero, intro, difference }: { hero: HeroContent; intro: IntroContent; difference: DifferenceContent }) {
  const [tab, setTab] = useState<Tab>("hero");
  const heroEd = useSectionEditor("hero", hero);
  const introEd = useSectionEditor("intro", intro);
  const diffEd = useSectionEditor("difference", difference);

  const tabs: { id: Tab; label: string; dirty: boolean }[] = [
    { id: "hero", label: "Hero", dirty: heroEd.dirty },
    { id: "intro", label: "More than creative", dirty: introEd.dirty },
    { id: "difference", label: "Why Brand House", dirty: diffEd.dirty },
  ];

  const tabBar = (
    <div role="tablist" aria-label="Homepage sections" className="mb-6 inline-flex rounded-full bg-white p-1 ring-1 ring-ink/10">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={tab === t.id}
          onClick={() => setTab(t.id)}
          className={cn(
            "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
            tab === t.id ? "bg-ink text-white" : "text-ink/65 hover:text-ink",
          )}
        >
          {t.label}
          {t.dirty ? <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-amber-500" aria-label="(unsaved)" /> : null}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div hidden={tab !== "hero"}>
        <EditorBar title="Homepage" description="The first thing visitors see. Changes go live when you publish." editor={heroEd} viewHref="/" />
        {tabBar}
        <HeroForm ed={heroEd} />
      </div>
      <div hidden={tab !== "intro"}>
        <EditorBar title="Homepage" description="The photo cards after the featured work." editor={introEd} viewHref="/#intro-title" />
        {tabBar}
        <IntroForm ed={introEd} />
      </div>
      <div hidden={tab !== "difference"}>
        <EditorBar title="Homepage" description="The section explaining what makes Brand House different." editor={diffEd} viewHref="/#diff-title" />
        {tabBar}
        <DifferenceForm ed={diffEd} />
      </div>
    </>
  );
}

function HeroForm({ ed }: { ed: ReturnType<typeof useSectionEditor<HeroContent>> }) {
  const v = ed.value;
  const set = (patch: Partial<HeroContent>) => ed.setValue({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <HeroPreview hero={v} />
      <Card title="Headline & text">
        <TextField label="Small heading above the headline" value={v.eyebrow} onChange={(eyebrow) => set({ eyebrow })} max={120} />
        <Grid>
          <TextField label="Headline, line 1" value={v.line1} onChange={(line1) => set({ line1 })} max={60} />
          <TextField label="Headline, line 2" value={v.line2} onChange={(line2) => set({ line2 })} max={60} hint="Optional. Each line animates in separately." />
        </Grid>
        <TextArea label="Intro paragraph" value={v.lead} onChange={(lead) => set({ lead })} max={400} />
      </Card>
      <Card title="Buttons">
        <Grid>
          <TextField label="Main button text" value={v.primaryCta.label} onChange={(label) => set({ primaryCta: { ...v.primaryCta, label } })} max={60} />
          <TextField label="Main button link" value={v.primaryCta.href} onChange={(href) => set({ primaryCta: { ...v.primaryCta, href } })} hint="A page on this site like /contact, or a full https:// link." />
          <TextField label="Second button text" value={v.secondaryCta.label} onChange={(label) => set({ secondaryCta: { ...v.secondaryCta, label } })} max={60} />
          <TextField label="Second button link" value={v.secondaryCta.href} onChange={(href) => set({ secondaryCta: { ...v.secondaryCta, href } })} />
        </Grid>
      </Card>
      <Card
        title="Moving reel"
        description="Photos that drift past beside the headline, in three columns. Use at least six; nine or twelve looks best. Portrait photos work best."
      >
        <Repeater
          items={v.reel}
          onChange={(reel) => set({ reel })}
          create={(): ReelFrame => ({ src: "", alt: "", label: "" })}
          itemLabel={(f, i) => f.label || f.alt.slice(0, 50) || `Photo ${i + 1}`}
          addLabel="Add a photo"
          max={18}
          render={(f, update) => (
            <>
              <ImageField label="Photo" value={f} onChange={(img) => update({ src: img.src, alt: img.alt })} aspect="aspect-[3/4]" />
              <TextField label="Label on the photo" value={f.label} onChange={(label) => update({ label })} max={40} hint="A couple of words, e.g. Product shoot. Leave empty for no label." />
            </>
          )}
        />
      </Card>
      <Card title="Moving words" description="The orange bar on the reel reads “We make …” and cycles through these. The ticker runs under the hero.">
        <StringList label="“We make …” words" value={v.making} onChange={(making) => set({ making })} addLabel="Add a word" max={8} placeholder="e.g. brand films" />
        <StringList
          label="Ticker"
          value={v.ticker}
          onChange={(ticker) => set({ ticker })}
          addLabel="Add an item"
          max={16}
          hint="Leave empty to show your service names automatically."
        />
      </Card>
    </div>
  );
}

function HeroPreview({ hero }: { hero: HeroContent }) {
  const thumbs = hero.reel.slice(0, 6);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#0b0b0c] p-6 text-[#fff] shadow-[0_10px_40px_-12px_rgba(17,17,17,0.45)] sm:p-8">
      <span className="rounded-full bg-[#fff]/15 px-2.5 py-1 text-[0.7rem] font-medium uppercase tracking-[0.12em]">Live preview</span>
      <div className="mt-5 grid items-center gap-6 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <div>
          {hero.eyebrow ? <p className="font-display text-sm text-[#fff]/70">{hero.eyebrow}</p> : null}
          <p className="mt-2 font-display text-[clamp(1.8rem,4vw,3.2rem)] font-bold leading-[0.92] tracking-[-0.04em]">
            {hero.line1}
            {hero.line2 ? (
              <>
                <br />
                <span className="text-accent">{hero.line2}</span>
              </>
            ) : null}
          </p>
          <p className="mt-4 max-w-md text-sm text-[#fff]/70">{hero.lead}</p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-accent px-4 py-2 text-xs font-medium text-[#111]">{hero.primaryCta.label}</span>
            <span className="rounded-full px-4 py-2 text-xs font-medium ring-1 ring-[#fff]/40">{hero.secondaryCta.label}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {thumbs.map((f, i) =>
            f.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={thumb(f.src, 384)} alt="" decoding="async" className="aspect-[3/4] w-full rounded-md object-cover" />
            ) : (
              <span key={i} className="aspect-[3/4] rounded-md bg-[#fff]/10" />
            ),
          )}
          <span className="col-span-3 mt-1 rounded-md bg-accent px-2 py-1.5 text-[0.7rem] font-semibold text-[#111]">We make {hero.making[0] ?? "…"}</span>
        </div>
      </div>
    </div>
  );
}

function IntroForm({ ed }: { ed: ReturnType<typeof useSectionEditor<IntroContent>> }) {
  const v = ed.value;
  const set = (patch: Partial<IntroContent>) => ed.setValue({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <Card title="Introduction">
        <TextField label="Heading" value={v.title} onChange={(title) => set({ title })} max={160} />
        <TextArea label="Statement" value={v.statement} onChange={(statement) => set({ statement })} max={600} />
      </Card>
      <Card title="Photo cards" description="Short points shown as photo cards under the statement (swipeable on phones). Three looks best.">
        <Repeater
          items={v.facts}
          onChange={(facts) => set({ facts })}
          create={() => ({ title: "", body: "", image: null })}
          itemLabel={(f) => f.title}
          addLabel="Add a fact"
          max={6}
          render={(f, update) => (
            <>
              <TextField label="Title" value={f.title} onChange={(title) => update({ title })} max={160} />
              <TextArea label="Text" value={f.body} onChange={(body) => update({ body })} max={600} />
              <ImageField
                label="Photo"
                value={f.image ?? { src: "", alt: "" }}
                onChange={(img) => update({ image: img.src ? { src: img.src, alt: img.alt } : null })}
                aspect="aspect-[4/5]"
              />
            </>
          )}
        />
      </Card>
    </div>
  );
}

function DifferenceForm({ ed }: { ed: ReturnType<typeof useSectionEditor<DifferenceContent>> }) {
  const v = ed.value;
  const set = (patch: Partial<DifferenceContent>) => ed.setValue({ ...v, ...patch });
  return (
    <div className="space-y-6">
      <Card title="Section heading">
        <TextField label="Heading" value={v.title} onChange={(title) => set({ title })} max={160} />
        <TextArea label="Intro text" value={v.lead} onChange={(lead) => set({ lead })} max={600} />
        <ImageField label="Photo under the heading" value={v.image} onChange={(image) => set({ image })} aspect="aspect-[4/3]" />
      </Card>
      <Card title="Points">
        <Repeater
          items={v.points}
          onChange={(points) => set({ points })}
          create={() => ({ title: "", body: "" })}
          itemLabel={(p) => p.title}
          addLabel="Add a point"
          max={10}
          render={(p, update) => (
            <>
              <TextField label="Title" value={p.title} onChange={(title) => update({ title })} max={160} />
              <TextArea label="Text" value={p.body} onChange={(body) => update({ body })} max={600} />
            </>
          )}
        />
      </Card>
    </div>
  );
}
