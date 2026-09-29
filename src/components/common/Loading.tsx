export default function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-brand-light border-t-transparent animate-spin" />
      <span className="ml-3 text-gray-500 text-sm">{label}</span>
    </div>
  );
}
