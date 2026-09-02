export function Footer() {
  return (
    <footer className="border-t border-border bg-paper py-10">
      <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 px-6 text-sm sm:flex-row md:px-20">
        <span className="text-faint">© {new Date().getFullYear()} StudyPilot AI. All rights reserved.</span>
        <div className="flex gap-6 text-body">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Support</span>
        </div>
      </div>
    </footer>
  );
}
