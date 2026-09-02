"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Button } from "@/components/ui/button";
import { AccentCard, StickyNote } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

/** Wraps a landed card in a slow, perpetual bob so the desk never goes fully still. */
function Float({
  children,
  duration,
  delay = 0,
  distance = 7,
}: {
  children: React.ReactNode;
  duration: number;
  delay?: number;
  distance?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      animate={reduceMotion ? undefined : { y: [0, -distance, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

/** Small cursor-driven horizontal drift, stronger for cards "closer" to the viewer. */
function useParallaxX(spring: MotionValue<number>, depth: number) {
  return useTransform(spring, [-0.5, 0.5], [-depth, depth]);
}

export function Hero() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 20, mass: 0.4 });

  function handlePointerMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
  }
  function handlePointerLeave() {
    mouseX.set(0);
  }

  const px1 = useParallaxX(springX, 8);
  const px2 = useParallaxX(springX, 15);
  const px3 = useParallaxX(springX, 10);
  const px4 = useParallaxX(springX, 18);
  const px5 = useParallaxX(springX, 16);
  const px6 = useParallaxX(springX, 13);
  const px7 = useParallaxX(springX, 20);

  return (
    <section className="relative mx-auto flex max-w-[1440px] flex-col items-center gap-14 overflow-hidden px-6 pb-20 pt-14 md:px-20 md:pb-28 md:pt-16">
      {/* ---- ambient drifting glow ---- */}
      <div
        aria-hidden
        className="hero-glow pointer-events-none absolute inset-0 -z-10 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(38% 30% at 24% 18%, rgba(223,186,75,0.22), transparent), radial-gradient(34% 28% at 78% 32%, rgba(212,106,67,0.16), transparent), radial-gradient(30% 26% at 55% 85%, rgba(110,127,94,0.14), transparent)",
        }}
      />

      <motion.div
        initial="hidden"
        animate="show"
        className="flex max-w-4xl flex-col items-center gap-4 text-center"
      >
        <motion.span variants={fadeUp} custom={0} className="text-xs font-bold uppercase tracking-[0.18em] text-faint">
          Gen AI Academic Copilot
        </motion.span>
        <motion.h1
          variants={fadeUp}
          custom={0.06}
          className="text-balance font-serif-display text-[40px] leading-[1.06] md:text-[68px]"
        >
          Stop studying everything.{" "}
          <span className="relative inline-block text-terracotta">
            Study what actually matters.
            <motion.svg
              aria-hidden
              viewBox="0 0 300 16"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 h-2.5 w-full text-terracotta/60 md:h-3.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.85, delay: 0.9, ease: "easeInOut" }}
            >
              <motion.path
                d="M4 10 Q 60 2, 120 9 T 296 7"
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                fill="none"
              />
            </motion.svg>
          </span>
        </motion.h1>
        <motion.p variants={fadeUp} custom={0.14} className="max-w-xl text-lg text-body">
          StudyPilot AI reads your lectures and past assessments, finds exactly what
          you&rsquo;re struggling with, and builds a study plan around your real exam dates —
          in whichever course you&rsquo;re actually taking.
        </motion.p>
        <motion.div variants={fadeUp} custom={0.22} className="mt-2 flex flex-wrap justify-center gap-3">
          <Button href="/onboarding" size="lg">
            Build My Study Plan <ArrowRight className="size-4" />
          </Button>
          <Button href="#professor-focus" variant="secondary" size="lg" className="normal-case font-semibold">
            See How It Reads
          </Button>
        </motion.div>
      </motion.div>

      {/* ---- desk canvas: desktop scatter ---- */}
      <div
        ref={canvasRef}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        className="relative hidden h-[440px] w-full max-w-[1180px] lg:block"
      >
        <motion.div
          initial={{ opacity: 0, rotate: -6, y: 16 }}
          animate={{ opacity: 1, rotate: -3, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
          style={{ x: px1 }}
          className="absolute left-[21%] top-0 z-[2] w-[29%] cursor-default"
        >
          <Float duration={4.2} delay={0.9}>
            <AccentCard accent="gold" className="p-6">
              <div className="mb-3 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-faint">
                <span>CHEM 201 — Lecture 4</span>
                <span className="normal-case">Pg. 4</span>
              </div>
              <p className="font-serif-display text-[22px] leading-tight">
                Nucleophilic Substitution Mechanisms
              </p>
              <p className="mt-3 text-[13px] leading-relaxed text-body">
                The rate-determining step in the SN1 pathway depends solely on substrate
                concentration, forming a carbocation intermediate.
              </p>
              <motion.div
                animate={reduceMotion ? undefined : { opacity: [1, 0.72, 1] }}
                transition={{ duration: 2.6, delay: 1.4, repeat: Infinity, ease: "easeInOut" }}
                className="mt-3 border border-gold-border bg-gold-bg px-2 py-1.5"
              >
                <p className="text-[13px] font-semibold">
                  * High exam correlation: appears on 83% of past midterms *
                </p>
              </motion.div>
            </AccentCard>
          </Float>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: 8, y: 16 }}
          animate={{ opacity: 1, rotate: 4, y: 0 }}
          transition={{ duration: 0.55, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.06, rotate: 0, zIndex: 20 }}
          style={{ x: px2 }}
          className="absolute left-[46%] top-[26%] z-[4] w-[19%] cursor-default"
        >
          <Float duration={3.6} delay={0.5}>
            <StickyNote>
              <span className="pin-dot bg-terracotta" />
              &ldquo;Prof. Sterling always tests the steric hindrance argument in question 4. Do
              not skip the thermodynamics chapter!&rdquo;
            </StickyNote>
          </Float>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotate: -6, y: 16 }}
          animate={{ opacity: 1, rotate: -1.5, y: 0 }}
          transition={{ duration: 0.55, delay: 0.44, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
          style={{ x: px3 }}
          className="absolute left-0 top-[12%] z-[3] w-[24%] cursor-default"
        >
          <Float duration={4.6} delay={1.1}>
            <AccentCard accent="terracotta" className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wide text-terracotta">
                  Organic Chem Exam
                </span>
                <span className="rounded-[4px] bg-terracotta-tint px-2 py-1 text-[11px] font-semibold text-terracotta">
                  In 12 days
                </span>
              </div>
              <p className="mt-3 font-serif-display text-2xl">Adaptive Milestones</p>
              <div className="mt-3 flex flex-col gap-1.5 text-[13px] text-body">
                <p>- Day 1-4: Master Stereochemistry (your primary gap)</p>
                <p>- Day 5-8: Catalysis kinetics review</p>
                <p>- Day 9-12: Simulated professor exam</p>
              </div>
            </AccentCard>
          </Float>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
          style={{ x: px4 }}
          className="absolute right-[8%] top-[7%] z-[5] w-[14%] -rotate-2 cursor-default"
        >
          <Float duration={3.2} delay={0.2} distance={5}>
            <div className="rounded-[4px] border border-terracotta bg-terracotta-tint px-3 py-2.5 shadow-[0_2px_4px_rgba(44,43,41,0.06)]">
              <p className="text-[11px] font-bold uppercase tracking-wide text-terracotta">Deadline</p>
              <p className="mt-0.5 text-xs text-ink">Midterm 1: 12 days</p>
            </div>
          </Float>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.56, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
          style={{ x: px5 }}
          className="absolute right-[3%] top-[26%] z-[5] w-[11.5%] -rotate-2 cursor-default"
        >
          <Float duration={3.9} delay={0.75} distance={5}>
            <div className="relative aspect-square">
              {["CARBOXYLIC ACID", "ALKYL HALIDE", "STEREO"].map((label, i) => (
                <div
                  key={label}
                  className="absolute rounded-[4px] border border-border bg-paper p-3 shadow-[0_2px_4px_rgba(44,43,41,0.06)]"
                  style={{ inset: `${i * 4}% 0 0 ${i * 4}%` }}
                >
                  <p className="text-[11px] font-bold text-sage">{label}</p>
                </div>
              ))}
            </div>
          </Float>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
          style={{ x: px6 }}
          className="absolute left-[3%] top-[75%] z-[5] w-[13%] -rotate-3 cursor-default"
        >
          <Float duration={4.1} delay={1.3} distance={5}>
            <div className="rounded-[4px] border border-gold-border bg-gold-bg p-3 shadow-[0_2px_4px_rgba(44,43,41,0.06)]">
              <p className="text-[11px] font-bold text-terracotta">Reminder</p>
              <p className="mt-1 text-xs text-ink">Review SN1/SN2 conditions before bed</p>
            </div>
          </Float>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.68, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.08, rotate: 0, zIndex: 20 }}
          style={{ x: px7 }}
          className="absolute left-[18%] top-[73%] z-[5] w-[11.5%] rotate-6 cursor-default"
        >
          <Float duration={3.4} delay={0.4} distance={5}>
            <div className="rounded-[4px] border border-border bg-paper p-3 shadow-[0_2px_4px_rgba(44,43,41,0.06)]">
              <p className="text-[11px] font-bold text-sage">Todo</p>
              <p className="mt-1 text-xs text-ink">Make flashcards for stereochemistry</p>
            </div>
          </Float>
        </motion.div>
      </div>

      {/* ---- mobile: stacked, unrotated ---- */}
      <div className="flex w-full max-w-md flex-col gap-4 lg:hidden">
        <AccentCard accent="gold" className="p-5">
          <div className="mb-2 flex justify-between text-[11px] font-semibold uppercase tracking-wide text-faint">
            <span>CHEM 201 — Lecture 4</span>
            <span className="normal-case">Pg. 4</span>
          </div>
          <p className="font-serif-display text-xl">Nucleophilic Substitution Mechanisms</p>
          <p className="mt-2 text-[13px] text-body">
            The rate-determining step in the SN1 pathway depends solely on substrate concentration.
          </p>
        </AccentCard>
        <StickyNote rotate="">
          &ldquo;Prof. Sterling always tests the steric hindrance argument in question 4.&rdquo;
        </StickyNote>
        <AccentCard accent="terracotta" className="p-5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-terracotta">
            Organic Chem Exam · In 12 days
          </span>
          <p className="mt-2 font-serif-display text-xl">Adaptive Milestones</p>
          <p className="mt-2 text-[13px] text-body">Day 1-4: Master Stereochemistry (your primary gap)</p>
        </AccentCard>
      </div>
    </section>
  );
}
