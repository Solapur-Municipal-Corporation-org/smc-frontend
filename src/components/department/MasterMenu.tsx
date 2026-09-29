interface MasterMenuProps {
  items: { key: string; label: string }[];
  activeKey?: string;
  onSelect: (key: string) => void;
}

// Clicking a master opens its entry form directly inline (no modal),
// per the established SMC portal UX pattern.
export default function MasterMenu({ items, activeKey, onSelect }: MasterMenuProps) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.key}>
          <button
            onClick={() => onSelect(item.key)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
              activeKey === item.key
                ? "bg-brand-light/10 text-brand-dark"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
