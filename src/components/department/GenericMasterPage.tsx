"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import api, { getApiErrorMessage } from "@/lib/department-api";
import { isAdmin } from "@/lib/department-auth";
import DataTable, { Column } from "@/components/department/DataTable";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "checkbox" | "select" | "textarea";
  required?: boolean;
  /** For "select" fields backed by another master, e.g. /masters/country */
  optionsEndpoint?: string;
  optionValueKey?: string; // e.g. "countryId"
  optionLabelKey?: string; // e.g. "countryName"
  /** Static options, used instead of optionsEndpoint */
  staticOptions?: SelectOption[];
}

interface GenericMasterPageProps<T extends { [key: string]: any }> {
  title: string;
  description: string;
  apiPath: string; // e.g. "/masters/country"
  idKey: string; // e.g. "countryId"
  columns: Column<T>[];
  searchKeys: (keyof T)[];
  formFields: FormField[];
  emptyRecord: Partial<T>;
}

/**
 * Master CRUD page: the entry form is shown directly on the page (no "Add"
 * button, no modal) — Submit saves and clears the form, Cancel navigates
 * back, and the table below supports Edit (loads the row into the form)
 * and Delete.
 */
export default function GenericMasterPage<T extends { [key: string]: any }>({
  title,
  description,
  apiPath,
  idKey,
  columns,
  searchKeys,
  formFields,
  emptyRecord,
}: GenericMasterPageProps<T>) {
  const router = useRouter();
  const formTopRef = useRef<HTMLDivElement>(null);

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<T>>(emptyRecord);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [optionsMap, setOptionsMap] = useState<Record<string, SelectOption[]>>({});
  const [error, setError] = useState<string | null>(null);
  const canWrite = isAdmin();

  const load = () => {
    setLoading(true);
    api.get<T[]>(apiPath).then((res) => setRows(res.data)).finally(() => setLoading(false));
  };

  useEffect(load, [apiPath]);

  // Fetch dropdown options for select fields backed by other masters
  useEffect(() => {
    formFields
      .filter((f) => f.type === "select" && f.optionsEndpoint)
      .forEach((f) => {
        api.get(f.optionsEndpoint!).then((res) => {
          const opts: SelectOption[] = res.data.map((item: any) => ({
            value: item[f.optionValueKey!],
            label: item[f.optionLabelKey!],
          }));
          setOptionsMap((prev) => ({ ...prev, [f.name]: opts }));
        });
      });
  }, [formFields]);

  const resetForm = () => {
    setFormData(emptyRecord);
    setEditingId(null);
    setError(null);
  };

  const handleChange = (name: string, value: any) => setFormData((prev) => ({ ...prev, [name]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (editingId !== null) {
        await api.put(`${apiPath}/${editingId}`, formData);
      } else {
        await api.post(apiPath, formData);
      }
      resetForm(); // clear the form after a successful submit
      load(); // refresh the table with the newly saved/updated row
    } catch (err: any) {
      setError(getApiErrorMessage(err, "Something went wrong. Please check the form and try again."));
    } finally {
      setSubmitting(false);
    }
  };

  const onEdit = (row: T) => {
    setFormData(row);
    setEditingId(row[idKey]);
    setError(null);
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onDelete = async (row: T) => {
    if (!confirm("Delete this record?")) return;
    await api.delete(`${apiPath}/${row[idKey]}`);
    if (editingId === row[idKey]) resetForm(); // if the deleted row was mid-edit, clear the form
    load();
  };

  const onCancel = () => {
    resetForm();
    router.back(); // go back to the previous page, per request
  };

  return (
    <div>
      <div ref={formTopRef} className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      {canWrite && (
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-gray-900">{editingId !== null ? `Edit ${title}` : `Add ${title}`}</h2>

          {formFields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === "textarea" ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC5288]"
                  required={field.required}
                  value={(formData as any)[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              ) : field.type === "checkbox" ? (
                <input
                  type="checkbox"
                  checked={!!(formData as any)[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                />
              ) : field.type === "select" ? (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC5288]"
                  required={field.required}
                  value={(formData as any)[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, Number(e.target.value) || e.target.value)}
                >
                  <option value="">Select...</option>
                  {(field.staticOptions || optionsMap[field.name] || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#AC5288]"
                  required={field.required}
                  value={(formData as any)[field.name] ?? ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 brand-gradient text-white font-medium py-2.5 rounded-lg disabled:opacity-60"
            >
              {submitting ? "Saving..." : editingId !== null ? "Update" : "Submit"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="h-40 bg-white rounded-xl border border-gray-200 animate-pulse" />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          searchKeys={searchKeys}
          onEdit={canWrite ? onEdit : undefined}
          onDelete={canWrite ? onDelete : undefined}
        />
      )}
    </div>
  );
}
