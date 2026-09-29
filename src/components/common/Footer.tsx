export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white/70 text-sm py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-2">
        <p>&copy; {new Date().getFullYear()} Solapur Municipal Corporation</p>
        <p>सोलापूर महानगरपालिका</p>
      </div>
    </footer>
  );
}
