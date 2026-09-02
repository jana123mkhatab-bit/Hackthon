import { PageHeader } from "@/components/app/page-header";
import { AccessibilityPanel } from "@/components/settings/accessibility-panel";

export const metadata = { title: "Accessibility — StudyPilot AI" };

export default function AccessibilitySettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Adaptive Learning & Accessibility"
        title="Accessibility"
        subtitle="Every toggle below is a preference, not a diagnosis — changes apply immediately across the whole app, and you can change any of it back at any time."
      />
      <div className="max-w-2xl">
        <AccessibilityPanel />
      </div>
    </div>
  );
}
