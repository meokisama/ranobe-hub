interface SectionHeadingProps {
  /** Kanji numeral set in the vermilion seal: 壱, 弐, 参… */
  mark: string;
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  /** On the ink-black bands. */
  dark?: boolean;
  as?: "h1" | "h2";
}

export function SectionHeading({ mark, label, title, children, dark, as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <header
      className={`grid gap-6 border-b pb-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:items-end lg:gap-16 lg:pb-11 ${
        dark ? "border-paper/25" : "border-sumi"
      }`}
    >
      <div>
        <p className={`flex items-center gap-3 font-label text-[11px] uppercase tracking-[0.28em] ${dark ? "text-paper/70" : "text-sumi-soft"}`}>
          <span lang="ja" className="grid size-7 place-items-center bg-shu font-mincho text-sm font-bold tracking-normal text-paper">
            {mark}
          </span>
          <span className={`h-px w-8 ${dark ? "bg-paper/30" : "bg-sumi/30"}`} />
          {label}
        </p>
        <Tag className={`mt-5 font-display text-[clamp(2.9rem,7.4vw,7.25rem)] leading-[0.92] tracking-[-0.035em] ${dark ? "text-paper" : "text-sumi"}`}>
          {title}
        </Tag>
      </div>
      {children && <p className={`text-[15px] font-light leading-[1.75] ${dark ? "text-paper/70" : "text-sumi-soft"}`}>{children}</p>}
    </header>
  );
}
