import Link from "next/link";
import { Service } from "@/types/citizen-portal";

/**
 * Renders a link to a service. If the service has `externalUrl` set (see
 * lib/mock-data.ts), it opens that URL in a new tab instead of the internal
 * /citizen/services/[serviceId] application form. className/children pass
 * through unchanged either way, so it's a drop-in replacement for <Link>.
 */
export function ServiceLink({
  service,
  className,
  children,
  onClick,
}: {
  service: Service;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  if (service.externalUrl) {
    return (
      <a href={service.externalUrl} target="_blank" rel="noopener noreferrer" onClick={onClick} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={`/citizen/services/${service.id}`} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
