interface ReportMenuProps {
  items: { key: string; label: string }[];
  onSelect: (key: string) => void;
}

export default function ReportMenu({ items, onSelect }: ReportMenuProps) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.key}>
          <button
            onClick={() => onSelect(item.key)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
