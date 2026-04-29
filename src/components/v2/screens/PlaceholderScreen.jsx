export default function PlaceholderScreen({ title }) {
  return (
    <section className="flex min-h-[50vh] flex-col justify-center gap-sm px-md py-xl text-center">
      <p className="text-label-caps uppercase text-text-secondary">Coming up</p>
      <h1 className="text-title-lg text-text-primary">{title}</h1>
      <p className="text-body-base text-text-secondary">
        This v2 screen lands in the next implementation phase.
      </p>
    </section>
  );
}
