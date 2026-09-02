"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Loader2, LinkIcon, Check, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  loadCalendarState,
  connectMockCalendar,
  disconnectMockCalendar,
  pushEventsMock,
  type CalendarMockState,
} from "@/lib/calendar-mock";
import { STUDENT } from "@/lib/mock-data";

export function CalendarConnect({ sessionCount }: { sessionCount: number }) {
  const [state, setState] = useState<CalendarMockState | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  // read localStorage after mount to avoid an SSR/client hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(loadCalendarState());
  }, []);

  if (!state) return null;

  async function connect() {
    setConnecting(true);
    const next = await connectMockCalendar(`${STUDENT.firstName.toLowerCase()}@gmail.com`);
    setState(next);
    setConnecting(false);
  }

  async function sync() {
    setSyncing(true);
    await pushEventsMock(sessionCount);
    setState(loadCalendarState());
    setSyncing(false);
    setJustSynced(true);
    setTimeout(() => setJustSynced(false), 2500);
  }

  if (!state.connected) {
    return (
      <Card className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <LinkIcon className="mt-0.5 size-4 shrink-0 text-faint" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Google Calendar isn&rsquo;t connected</span>
            <span className="text-xs text-faint">
              Mock integration for this prototype — no real Google account is contacted.
            </span>
          </div>
        </div>
        <Button onClick={connect} variant="secondary" className="shrink-0 normal-case font-semibold" disabled={connecting}>
          {connecting ? <Loader2 className="size-4 animate-spin" /> : <CalendarCheck className="size-4" />}
          {connecting ? "Connecting..." : "Connect Google Calendar (Mock)"}
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-start gap-3 border-sage/40 bg-bg-sage-tint p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-sage text-paper">
          <Check className="size-4" strokeWidth={2.5} />
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">Connected as {state.email} (mock)</span>
          <span className="text-xs text-faint">
            {justSynced
              ? `Synced ${sessionCount} sessions just now.`
              : state.lastSyncedAt
              ? `Last synced ${new Date(state.lastSyncedAt).toLocaleString()}`
              : "Not synced yet"}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button onClick={sync} variant="secondary" className="normal-case font-semibold" disabled={syncing}>
          {syncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
          {syncing ? "Syncing..." : "Sync This Week"}
        </Button>
        <Button
          onClick={() => setState(disconnectMockCalendar())}
          variant="ghost"
          className="normal-case font-semibold text-faint"
        >
          Disconnect
        </Button>
      </div>
    </Card>
  );
}
