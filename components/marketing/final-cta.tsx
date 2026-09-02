import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="bg-bg-sage-tint py-24">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center md:px-0">
        <h2 className="text-balance font-serif-display text-3xl md:text-[48px]">
          Clear your desk. Secure your pilot.
        </h2>
        <p className="text-body">
          Join students across every major using the only academic copilot modeled
          around their real final exam deadlines.
        </p>
        <Button href="/onboarding" size="lg">
          Fly for Free Today <ArrowRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}
