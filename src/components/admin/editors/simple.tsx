"use client";

import { MessageSquareQuote } from "lucide-react";
import type { AboutContent, Settings, Testimonial } from "@/lib/cms/types";
import { EditorBar, useSectionEditor } from "../editor";
import { ImageField } from "../media";
import { Card, EmptyState, Grid, Repeater, TextArea, TextField, Toggle } from "../ui";

/* ───────────── About ───────────── */

export function AboutEditor({ initial }: { initial: AboutContent }) {
  const ed = useSectionEditor("about", initial);
  const v = ed.value;
  const set = (patch: Partial<AboutContent>) => ed.setValue({ ...v, ...patch });
  return (
    <>
      <EditorBar title="About page" description="Your story, approach and values." editor={ed} viewHref="/about" />
      <div className="space-y-6">
        <Card title="Page header">
          <TextArea label="Page heading" value={v.title} onChange={(title) => set({ title })} max={200} />
          <TextArea label="Intro" value={v.intro} onChange={(intro) => set({ intro })} max={800} />
        </Card>
        <Card title="Why we exist">
          <ImageField label="Image" value={v.image} onChange={(image) => set({ image })} aspect="aspect-[4/5]" hint="Portrait (4:5) works best." />
          <TextField label="Heading" value={v.purposeTitle} onChange={(purposeTitle) => set({ purposeTitle })} max={120} />
          <Repeater
            label="Paragraphs"
            items={v.purposeParagraphs.map((text) => ({ text }))}
            onChange={(items) => set({ purposeParagraphs: items.map((i) => i.text) })}
            create={() => ({ text: "" })}
            itemLabel={(p) => p.text.slice(0, 60)}
            addLabel="Add a paragraph"
            max={6}
            render={(p, update) => <TextArea label="Paragraph" value={p.text} onChange={(text) => update({ text })} max={1500} rows={4} />}
          />
        </Card>
        <Card title="Our approach" description="The dark band with two columns of text.">
          <TextField label="Heading" value={v.approachTitle} onChange={(approachTitle) => set({ approachTitle })} max={160} />
          <Grid>
            <TextArea label="Left column" value={v.approachLeft} onChange={(approachLeft) => set({ approachLeft })} max={1500} rows={5} />
            <TextArea label="Right column" value={v.approachRight} onChange={(approachRight) => set({ approachRight })} max={1500} rows={5} />
          </Grid>
        </Card>
        <Card title="Divisions" description="Lists your services. Each service's one-liner here is edited on that service's page under “About page note”.">
          <TextField label="Heading" value={v.divisionsTitle} onChange={(divisionsTitle) => set({ divisionsTitle })} max={160} />
          <TextArea label="Intro" value={v.divisionsIntro} onChange={(divisionsIntro) => set({ divisionsIntro })} max={600} />
        </Card>
        <Card title="Values">
          <TextField label="Heading" value={v.valuesTitle} onChange={(valuesTitle) => set({ valuesTitle })} max={120} />
          <Repeater
            items={v.values}
            onChange={(values) => set({ values })}
            create={() => ({ title: "", body: "" })}
            itemLabel={(x) => x.title}
            addLabel="Add a value"
            max={8}
            render={(x, update) => (
              <>
                <TextField label="Title" value={x.title} onChange={(title) => update({ title })} max={160} />
                <TextArea label="Text" value={x.body} onChange={(body) => update({ body })} max={600} />
              </>
            )}
          />
        </Card>
        <Card title="Closing call to action">
          <TextField label="Heading" value={v.ctaTitle} onChange={(ctaTitle) => set({ ctaTitle })} max={160} />
          <TextArea label="Text" value={v.ctaBody} onChange={(ctaBody) => set({ ctaBody })} max={400} />
        </Card>
      </div>
    </>
  );
}

/* ───────────── Contact & social ───────────── */

export function SettingsEditor({ initial }: { initial: Settings }) {
  const ed = useSectionEditor("settings", initial);
  const v = ed.value;
  const set = (patch: Partial<Settings>) => ed.setValue({ ...v, ...patch });
  const setContact = (patch: Partial<Settings["contact"]>) => set({ contact: { ...v.contact, ...patch } });
  return (
    <>
      <EditorBar title="Contact & social" description="Shown in the footer, contact page, menus and Google listings." editor={ed} viewHref="/contact" />
      <div className="space-y-6">
        <Card title="Contact details" description="Leave a field empty to hide it everywhere on the site.">
          <Grid>
            <TextField label="Email" type="email" value={v.contact.email} onChange={(email) => setContact({ email })} />
            <TextField label="Phone" value={v.contact.phone} onChange={(phone) => setContact({ phone })} placeholder="+254 7XX XXX XXX" />
            <TextField
              label="WhatsApp number"
              value={v.contact.whatsapp}
              onChange={(whatsapp) => setContact({ whatsapp: whatsapp.replace(/\D/g, "") })}
              hint="Digits only, with country code: 254740953007. Powers the green WhatsApp button."
            />
            <TextField label="Location" value={v.contact.location} onChange={(location) => setContact({ location })} placeholder="Nairobi, Kenya" />
          </Grid>
          <TextArea
            label="WhatsApp starter message"
            value={v.contact.whatsappMessage}
            onChange={(whatsappMessage) => setContact({ whatsappMessage })}
            max={300}
            hint="Pre-filled when a visitor taps the WhatsApp button."
          />
        </Card>
        <Card title="Social media" description="Paste the full link to each profile. Empty ones are hidden.">
          <Repeater
            items={v.social}
            onChange={(social) => set({ social })}
            create={() => ({ label: "", href: "" })}
            itemLabel={(s) => s.label}
            addLabel="Add a network"
            max={12}
            render={(s, update) => (
              <Grid>
                <TextField label="Network" value={s.label} onChange={(label) => update({ label })} placeholder="Instagram" />
                <TextField label="Profile link" value={s.href} onChange={(href) => update({ href })} placeholder="https://instagram.com/brandhouse" />
              </Grid>
            )}
          />
        </Card>
        <Card title="Site-wide text">
          <TextField label="Tagline" value={v.descriptor} onChange={(descriptor) => set({ descriptor })} max={120} hint="Used in the footer and browser tab titles." />
          <TextArea label="Short description" value={v.statement} onChange={(statement) => set({ statement })} max={400} hint="Footer text and the description Google shows for the site." />
        </Card>
        <Card title="Portfolio">
          <Toggle
            label="Show sample concept projects"
            checked={v.showSampleProjects}
            onChange={(showSampleProjects) => set({ showSampleProjects })}
            hint="The site launched with illustrative sample projects for fictional brands. Switch this off once you've added enough real work."
          />
        </Card>
      </div>
    </>
  );
}

/* ───────────── Testimonials ───────────── */

export function TestimonialsEditor({ initial }: { initial: Testimonial[] }) {
  const ed = useSectionEditor("testimonials", initial);
  const create = (): Testimonial => ({ quote: "", name: "", role: "", company: "" });
  return (
    <>
      <EditorBar
        title="Testimonials"
        description="Client quotes on the homepage. The section stays hidden until you add at least one."
        editor={ed}
        viewHref="/#voices-title"
      />
      {ed.value.length === 0 ? (
        <EmptyState
          icon={<MessageSquareQuote className="size-6" />}
          title="No testimonials yet"
          body="Only add genuine quotes your clients have approved for publishing."
          action={
            <button type="button" onClick={() => ed.setValue([create()])} className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
              Add the first testimonial
            </button>
          }
        />
      ) : (
        <Card>
          <Repeater
            items={ed.value}
            onChange={ed.setValue}
            create={create}
            itemLabel={(t) => (t.name ? `${t.name}${t.company ? `, ${t.company}` : ""}` : "New testimonial")}
            addLabel="Add testimonial"
            max={30}
            render={(t, update) => (
              <>
                <TextArea label="Quote" value={t.quote} onChange={(quote) => update({ quote })} max={800} rows={3} hint="No quotation marks needed; they're added automatically." />
                <Grid cols={3}>
                  <TextField label="Name" value={t.name} onChange={(name) => update({ name })} />
                  <TextField label="Job title" value={t.role} onChange={(role) => update({ role })} />
                  <TextField label="Company" value={t.company} onChange={(company) => update({ company })} />
                </Grid>
              </>
            )}
          />
        </Card>
      )}
    </>
  );
}

