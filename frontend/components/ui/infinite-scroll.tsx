"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const DURATIONS = { fast: "20s", normal: "40s", slow: "80s" } as const;

interface InfiniteScrollProps {
  /** Source of the strip image; it is rendered twice to make the loop seamless. */
  src: string;
  direction?: "left" | "right";
  speed?: keyof typeof DURATIONS;
  pauseOnHover?: boolean;
  className?: string;
}

export const InfiniteScroll = ({ src, direction = "left", speed = "fast", pauseOnHover = true, className }: InfiniteScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty("--animation-direction", direction === "left" ? "forwards" : "reverse");
    el.style.setProperty("--animation-duration", DURATIONS[speed]);
    setStarted(true);
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn("scroller relative z-20 overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]", className)}
    >
      <div className={cn("flex w-full flex-nowrap", started && "animate-scroll", pauseOnHover && "hover:[animation-play-state:paused]")}>
        {[0, 1].map((i) => (
          <Image
            key={i}
            src={src}
            alt={i === 0 ? "light novel cover carousel" : ""}
            width={2880}
            height={230}
            aria-hidden={i === 1}
            className="h-[300px] w-full object-cover md:h-[230px]"
            quality={100}
          />
        ))}
      </div>
    </div>
  );
};
