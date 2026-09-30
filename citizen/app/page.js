import Link from "next/link";

export default function Home() {
  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 8 }}>
      <h1>Apply for a Certificate</h1>
      <p>Select the certificate type to begin an application.</p>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Link href="/register" style={btn}>New Birth Registration</Link>
        <Link href="/death-register" style={btn}>New Death Registration</Link>
        <Link href="/status" style={btnOutline}>Check Application Status</Link>
      </div>
    </div>
  );
}

const btn = {
  background: "linear-gradient(110deg, #ad5288 0%, #762c70 52%, #42114f 100%)", color: "#fff", padding: "12px 20px",
  borderRadius: 6, textDecoration: "none", fontWeight: 600,
};
const btnOutline = {
  border: "1px solid #0b3d91", color: "#0b3d91", padding: "12px 20px",
  borderRadius: 6, textDecoration: "none", fontWeight: 600,
};
