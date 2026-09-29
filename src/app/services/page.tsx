import Link from "next/link";

const INTEGRATED_SERVICES = [
  { key: "service-a", name: "Service A" },
  { key: "service-b", name: "Service B" },
  { key: "service-c", name: "Service C" },
];

export default function ServicesIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Integrated Services</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {INTEGRATED_SERVICES.map((s) => (
          <Link
            key={s.key}
            href={`/services/integrated/${s.key}`}
            className="rounded-xl border border-gray-200 p-5 hover:border-brand-light transition"
          >
            <h3 className="font-medium text-gray-900">{s.name}</h3>
            <p className="text-sm text-gray-500 mt-1">Apply via the integrated adapter</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
