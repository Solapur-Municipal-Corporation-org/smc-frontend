import ServiceHeader from "./ServiceHeader";

interface ServiceShellProps {
  title: string;
  titleMr?: string;
  children: React.ReactNode;
}

// Common shell every integrated service (Service A/B/C) is wrapped in,
// so third-party services feel native to the Master Portal.
export default function ServiceShell({ title, titleMr, children }: ServiceShellProps) {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <ServiceHeader title={title} titleMr={titleMr} />
      <div className="mt-6">{children}</div>
    </div>
  );
}
