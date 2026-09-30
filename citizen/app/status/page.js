"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusLookupPage() {
  const [applicationNumber, setApplicationNumber] = useState("");
  const router = useRouter();

  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <h1>Check Application Status</h1>
      <input
        value={applicationNumber}
        onChange={(e) => setApplicationNumber(e.target.value)}
        placeholder="e.g. BIRTH-20260727153000-1234"
        style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 4, marginBottom: 12 }}
      />
      <button
        onClick={() => applicationNumber && router.push(`/status/${applicationNumber}`)}
        style={{ background: "linear-gradient(110deg, #ad5288 0%, #762c70 52%, #42114f 100%)", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}
      >
        Check Status
      </button>
    </div>
  );
}
