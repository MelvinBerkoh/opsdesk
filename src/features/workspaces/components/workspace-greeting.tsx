"use client";

import { useSyncExternalStore } from "react";

function getGreeting(hour: number) {
  if (hour < 12) {
    return "Good morning.";
  }

  if (hour < 18) {
    return "Good afternoon.";
  }

  return "Good evening.";
}

function subscribe(callback: () => void) {
  const interval = window.setInterval(callback, 60_000);

  return () => {
    window.clearInterval(interval);
  };
}

function getClientSnapshot() {
  return getGreeting(new Date().getHours());
}

function getServerSnapshot() {
  return "Welcome back.";
}

export function WorkspaceGreeting() {
  const greeting = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  return (
    <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#171927] lg:text-[38px]">
      {greeting}
    </h1>
  );
}