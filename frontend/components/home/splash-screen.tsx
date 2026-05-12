"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const SplashScreen = () => {
  const [shouldUnmount, setShouldUnmount] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Animation timing constants
  const TOTAL_DURATION = 10000;
  const FADE_IN_DELAY = 2000;
  const TEXT_FADE_DELAY = 3500;
  const CIRCLE_REVEAL_DELAY = 6000;
  const FADE_IN_DURATION = 1500;
  const TEXT_FADE_DURATION = 1500;
  const CIRCLE_REVEAL_DURATION = 2000;

  useEffect(() => {
    if (sessionStorage.getItem("splash-home-seen")) {
      setShouldUnmount(true);
      return;
    }

    document.body.style.position = "fixed";
    document.body.style.width = "100vw";
    const timeoutId = setTimeout(() => {
      sessionStorage.setItem("splash-home-seen", "1");
      document.body.style.position = "";
      document.body.style.width = "";
      setShouldUnmount(true);
    }, TOTAL_DURATION + 1000);

    return () => {
      clearTimeout(timeoutId);
      document.body.style.position = "";
      document.body.style.width = "";
    };
  }, []);

  const handleImageLoad = () => {
    setImagesLoaded(true);
  };

  return shouldUnmount ? null : (
    <motion.div
      className="flex flex-col lg:flex-row fixed inset-0 z-100 w-screen h-screen bg-background"
      initial={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      animate={{
        clipPath: [
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
        ],
      }}
      transition={{
        duration: TOTAL_DURATION / 1000,
        times: [0, 0.99, 1],
        ease: "easeInOut",
      }}
      style={{
        willChange: "transform, clip-path",
      }}
    >
      <div className="w-full h-1/2 lg:h-full lg:w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ clipPath: "circle(0% at 50% 50%)" }}
          animate={{ clipPath: "circle(150% at 50% 50%)" }}
          transition={{
            duration: CIRCLE_REVEAL_DURATION / 1000,
            delay: CIRCLE_REVEAL_DELAY / 1000,
            ease: "easeInOut",
          }}
          className="absolute inset-0 z-10"
        >
          <Image
            src="/shiro_clr.jpg"
            alt="shiro no game no life"
            width={913}
            height={1302}
            className="w-full h-full object-cover object-[center_25%] lg:object-top select-none pointer-events-none"
            priority
            onLoad={handleImageLoad}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUFTRjo/Tj4yMkhiS0hHSUZJPVBVXWRkZGRkZGT/2wBDARUXFx4aHjshITtBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imagesLoaded ? 1 : 0 }}
          transition={{
            duration: FADE_IN_DURATION / 1000,
            delay: FADE_IN_DELAY / 1000,
            ease: "easeIn",
          }}
          className="absolute inset-0"
        >
          <Image
            src="/shiro_bw.jpg"
            alt="shiro no game no life"
            width={913}
            height={1302}
            className="w-full h-full object-cover object-[center_25%] lg:object-top select-none pointer-events-none"
            priority
            onLoad={handleImageLoad}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUFTRjo/Tj4yMkhiS0hHSUZJPVBVXWRkZGRkZGT/2wBDARUXFx4aHjshITtBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </motion.div>
      </div>
      <div className="w-full h-1/2 lg:h-full lg:w-1/2 relative overflow-hidden">
        <motion.div
          initial={{ clipPath: "circle(0% at 50% 50%)" }}
          animate={{ clipPath: "circle(150% at 50% 50%)" }}
          transition={{
            duration: CIRCLE_REVEAL_DURATION / 1000,
            delay: CIRCLE_REVEAL_DELAY / 1000,
            ease: "easeInOut",
          }}
          className="absolute inset-0 z-10"
        >
          <Image
            src="/sora_clr.jpg"
            alt="sora no game no life"
            width={913}
            height={1302}
            className="w-full h-full object-cover object-top select-none pointer-events-none"
            priority
            onLoad={handleImageLoad}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUFTRjo/Tj4yMkhiS0hHSUZJPVBVXWRkZGRkZGT/2wBDARUXFx4aHjshITtBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imagesLoaded ? 1 : 0 }}
          transition={{
            duration: FADE_IN_DURATION / 1000,
            delay: FADE_IN_DELAY / 1000,
            ease: "easeIn",
          }}
          className="absolute inset-0"
        >
          <Image
            src="/sora_bw.jpg"
            alt="sora no game no life"
            width={913}
            height={1302}
            className="w-full h-full object-cover object-top select-none pointer-events-none"
            priority
            onLoad={handleImageLoad}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUFTRjo/Tj4yMkhiS0hHSUZJPVBVXWRkZGRkZGT/2wBDARUXFx4aHjshITtBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkFBNkH/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </motion.div>
      </div>

      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: imagesLoaded ? 1 : 0 }}
          transition={{
            duration: TEXT_FADE_DURATION / 1000,
            delay: TEXT_FADE_DELAY / 1000,
          }}
          className="relative"
        >
          <motion.div
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(150% at 50% 50%)" }}
            transition={{
              duration: CIRCLE_REVEAL_DURATION / 1000,
              delay: CIRCLE_REVEAL_DELAY / 1000,
              ease: "easeInOut",
            }}
            className="absolute inset-0 text-primary z-10 text-center font-jaro drop-shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]"
          >
            <p className="select-none pointer-events-none leading-none mt-0 text-[20vw] lg:text-[10vw] tracking-tight bg-[linear-gradient(45deg,_#f9ab4a_20%,_#fff35b_100%)] drop-shadow-[0px_3px_8px_rgba(0,0,0,_0.5)] [text-outline:1px_solid_black] bg-clip-text text-transparent">
              RANOBE
            </p>
            <p className="select-none pointer-events-none leading-none -mt-[6vw] lg:-mt-[3vw] text-[21vw] lg:text-[10.25vw] tracking-tight bg-[linear-gradient(45deg,_#f9ab4a_20%,_#fff35b_100%)] drop-shadow-[0px_3px_8px_rgba(0,0,0,_0.5)] [text-outline:1px_solid_black] bg-clip-text text-transparent">
              READER
            </p>
          </motion.div>
          <div className="text-white drop-shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)] text-center font-jaro">
            <p className="select-none pointer-events-none leading-none mt-0 text-[20vw] lg:text-[10vw] tracking-tight">RANOBE</p>
            <p className="select-none pointer-events-none leading-none -mt-[6vw] lg:-mt-[3vw] text-[21vw] lg:text-[10.25vw] tracking-tight">READER</p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
