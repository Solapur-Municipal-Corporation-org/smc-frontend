import type { Service } from "@/types/service";

export default function ServiceMenu({ services }: { services: Service[] }) {
  return (
    <ul className="divide-y divide-gray-100">
      {services.map((service) => (
        <li key={service.id} className="py-2 text-sm text-gray-700">
          {service.nameEn}
        </li>
      ))}
    </ul>
  );
}
