interface TransactionMenuProps {
  items: { key: string; label: string }[];
  activeKey?: string;
  onSelect: (key: string) => void;
}

export default function TransactionMenu({ items, activeKey, onSelect }: TransactionMenuProps) {
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
