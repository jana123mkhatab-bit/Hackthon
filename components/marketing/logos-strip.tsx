const SCHOOLS = ["Stanford", "UC Berkeley", "MIT", "Columbia", "Oxford", "NYU"];

export function LogosStrip() {
  return (
    <section className="border-y border-border bg-paper py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-4 px-6 text-center md:px-20">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-faint">
          Trusted by students across competitive universities
        </span>
        <div className="flex flex-wrap justify-center gap-x-10 gap-y-2">
          {SCHOOLS.map((s) => (
            <span key={s} className="font-serif-display text-xl italic text-faint">
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
