export const metadata = {
  title: "BDMS Clerk Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f4f6f8" }}>{children}</body>
    </html>
  );
}
