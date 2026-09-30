export const metadata = {
  title: "SMC Solapur — Birth & Death Registration",
  description: "Citizen portal for Birth & Death certificate applications",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: 0, background: "#f4f6f8" }}>
        <header style={{ background: "linear-gradient(110deg, #ad5288 0%, #762c70 52%, #42114f 100%)", color: "#fff", padding: "16px 24px" }}>
          <strong>Solapur Municipal Corporation — Birth &amp; Death Management System</strong>
        </header>
        <main style={{ maxWidth: 720, margin: "32px auto", padding: "0 16px 64px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
