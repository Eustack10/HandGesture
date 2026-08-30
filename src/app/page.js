"use client";

import dynamic from "next/dynamic";

const App = dynamic(() => import("../App"), {
  ssr: false,
  loading: () => <div className="boot">Loading studio…</div>,
});

export default function Page() {
  return <App />;
}
