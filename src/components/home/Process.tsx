import { ProcessSteps } from "../ProcessSteps";

export function Process() {
  return (
    <section aria-labelledby="process-title" className="bg-paper">
      <div className="shell py-24 md:py-36">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="process-title" className="type-display md:col-span-7">
            How we work
          </h2>
          <p className="leading-relaxed text-mute-2 md:col-span-4 md:col-start-9">
            Every project, from a logo to a full campaign, moves through the same four stages. You sign off at each
            one before we move on.
          </p>
        </div>
        <div className="mt-16 md:mt-24">
          <ProcessSteps />
        </div>
      </div>
    </section>
  );
}
