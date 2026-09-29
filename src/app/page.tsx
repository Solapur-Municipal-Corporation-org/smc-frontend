import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-gradient flex items-center justify-center px-6">
      <div className="max-w-xl text-center text-white">
        <p className="text-sm tracking-wide text-white/70 mb-3">
          सोलापूर महानगरपालिका · Solapur Municipal Corporation
        </p>
        <h1 className="text-4xl font-semibold leading-tight mb-4">
          SMC Master Portal
        </h1>
        <p className="text-white/80 mb-8">
          One portal for citizen services, department operations and
          integrated third-party services.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/citizen/login"
            className="inline-block bg-white text-brand-dark font-medium px-6 py-3 rounded-lg hover:bg-white/90 transition"
          >
            Citizen Sign In
          </Link>
          <Link
            href="/login"
            className="inline-block border border-white/40 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition"
          >
            Department / Staff Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}
