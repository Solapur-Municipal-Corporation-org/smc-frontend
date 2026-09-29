export default function ServiceHeader({ title, titleMr }: { title: string; titleMr?: string }) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      {titleMr && <p className="text-sm text-gray-500 font-marathi mt-0.5">{titleMr}</p>}
    </div>
  );
}
