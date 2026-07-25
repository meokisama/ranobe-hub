"use client";
import Image from "next/image";
import { motion } from "motion/react";
import { useState } from "react";
import { useSplashGate } from "@/lib/use-splash-gate";

const TOTAL_DURATION = 5500;
const FADE_IN_DELAY = 500;
const TEXT_FADE_DELAY = 1500;
const CIRCLE_REVEAL_DELAY = 3000;
const FADE_IN_DURATION = 1000;
const TEXT_FADE_DURATION = 1000;
const CIRCLE_REVEAL_DURATION = 1500;

const HOME_SPLASH_DURATION_MS = TOTAL_DURATION + 500;
const HOME_SPLASH_STORAGE_KEY = "splash-home-seen";

const SplashScreen = () => {
  const shouldUnmount = useSplashGate(HOME_SPLASH_STORAGE_KEY, HOME_SPLASH_DURATION_MS, "fixed");
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const handleImageLoad = () => {
    setImagesLoaded(true);
  };

  const splitTransition = {
    duration: TOTAL_DURATION / 1000,
    times: [0, 0.86, 1],
    ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
  };

  const splashContent = (
    <>
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
            onLoad={handleImageLoad}
            quality={75}
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
            onLoad={handleImageLoad}
            quality={75}
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
            onLoad={handleImageLoad}
            quality={75}
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
    </>
  );

  return shouldUnmount ? null : (
    <>
      <motion.div
        className="flex flex-col lg:flex-row fixed inset-0 z-100 w-screen h-screen bg-background"
        style={{ clipPath: "inset(0 50% 0 0)", willChange: "transform" }}
        initial={{ x: 0 }}
        animate={{ x: [0, 0, "-50%"] }}
        transition={splitTransition}
      >
        {splashContent}
      </motion.div>
      <motion.div
        className="flex flex-col lg:flex-row fixed inset-0 z-100 w-screen h-screen bg-background"
        style={{ clipPath: "inset(0 0 0 50%)", willChange: "transform" }}
        initial={{ x: 0 }}
        animate={{ x: [0, 0, "50%"] }}
        transition={splitTransition}
      >
        {splashContent}
      </motion.div>
    </>
  );
};

export default SplashScreen;
