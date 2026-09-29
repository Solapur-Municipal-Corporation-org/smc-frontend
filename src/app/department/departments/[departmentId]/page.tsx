import { redirect } from "next/navigation";

export default async function DepartmentDetailRedirect({
  params,
}: {
  params: Promise<{ departmentId: string }>;
}) {
  const { departmentId } = await params;
  redirect(`/department/departments/${departmentId}/masters`);
}
