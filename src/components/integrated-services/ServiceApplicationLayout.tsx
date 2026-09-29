interface ServiceApplicationLayoutProps {
  form: React.ReactNode;
  summary: React.ReactNode;
}

export default function ServiceApplicationLayout({ form, summary }: ServiceApplicationLayoutProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">{form}</div>
      <aside className="rounded-xl border border-gray-200 p-4 h-fit sticky top-20">{summary}</aside>
    </div>
  );
}
