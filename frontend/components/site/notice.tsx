import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface NoticeProps {
  /** Large hollow kanji behind the message. */
  kanji: string;
  /** Small label above the title, e.g. "404". */
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  /** Shows a link back to the shelf. */
  homeLink?: boolean;
}

/** Full-screen paper notice: 404, maintenance, unsubscribe. */
export function Notice({ kanji, label, title, children, homeLink }: NoticeProps) {
  return (
    <div className="site">
      <main className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <span
          aria-hidden
          lang="ja"
          className="text-outline pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-mincho text-[52vw] font-extrabold leading-none text-sumi/[0.1] lg:text-[30vw]"
        >
          {kanji}
        </span>

        <p className="flex items-center gap-3 font-label text-[11px] uppercase tracking-[0.3em] text-sumi-soft">
          <span className="size-1.5 rounded-full bg-shu" />
          {label}
        </p>
        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.95] tracking-[-0.035em] text-sumi">{title}</h1>
        {children && <div className="mt-6 max-w-md text-[15px] font-light leading-[1.75] text-sumi-soft">{children}</div>}

        {homeLink && (
          <Link
            href="/"
            className="group mt-10 inline-flex h-13 items-center gap-3 rounded-full bg-sumi pl-7 pr-2.5 text-sm font-medium text-paper transition-colors duration-300 hover:bg-shu"
          >
            Về lại kệ sách
            <span className="grid size-8 place-items-center rounded-full bg-paper text-sumi transition-transform duration-500 group-hover:translate-x-0.5">
              <ArrowRight className="size-4" strokeWidth={1.75} />
            </span>
          </Link>
        )}
      </main>
    </div>
  );
}
