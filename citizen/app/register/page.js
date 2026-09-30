"use client";

import { useState } from "react";
import { api } from "../../lib/api";

const initialForm = {
  fatherName: "", fatherAadharNumber: "", fatherMobileNumber: "",
  permanentAddress: "", fatherEmail: "",
  motherName: "", motherAadharNumber: "", motherMobileNumber: "",
  childBirthDate: "", childGender: "", childBirthPlace: "",
  childNameMarathi: "", childNameEnglish: "",
  isAppliedAfterFifteenYears: "", navnondni: "", vartaNumber: "",
};

// Registration flow: form -> documents -> success.
export default function RegisterPage() {
  const [phase, setPhase] = useState("form");
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [tempApplicationNumber, setTempApplicationNumber] = useState(null);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [atLeastTwoRequired, setAtLeastTwoRequired] = useState(false);
  const [uploadedKeys, setUploadedKeys] = useState({});
  const [finalApplicationNumber, setFinalApplicationNumber] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function toApiForm() {
    const toEnumValue = (value) => {
      if (value === "Yes") return "Yes";
      if (value === "No") return "No";
      return value || null;
    };

    return {
      ...form,
      childBirthDate: form.childBirthDate || null,
      childGender: form.childGender === "Male" ? "Male" : form.childGender === "Female" ? "Female" : form.childGender || null,
      isAppliedAfterFifteenYears: toEnumValue(form.isAppliedAfterFifteenYears),
      navnondni: toEnumValue(form.navnondni),
    };
  }

  // ---- Submit click: create temp application and continue to documents ----
  async function handleFirstSubmit() {
    setBusy(true);
    setMessage("");
    try {
      const result = await api.createTemp(toApiForm());
      setTempApplicationNumber(result.tempApplicationNumber);
      setRequiredDocuments(result.requiredDocuments || []);
      setAtLeastTwoRequired(result.atLeastTwoOfListRequired || false);
      setMessage(result.message);
      setPhase("documents");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpload(key, file) {
    if (!file) return;
    setBusy(true);
    try {
      await api.uploadDocument(tempApplicationNumber, key, file);
      setUploadedKeys((u) => ({ ...u, [key]: file.name }));
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  // ---- "Upload & Submit": move temp -> permanent, get real application number ----
  async function handleFinalize() {
    setBusy(true);
    setMessage("");
    try {
      const result = await api.finalize(tempApplicationNumber);
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      setFinalApplicationNumber(result.applicationNumber);
      setPhase("success");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={card}>
      <h1>Birth Registration</h1>
      <PhaseIndicator phase={phase} />

      {phase === "form" && (
        <section>
          <Field label="Father's Name"><input value={form.fatherName} onChange={update("fatherName")} style={input} /></Field>
          <Field label="Father's Aadhar Number"><input value={form.fatherAadharNumber} onChange={update("fatherAadharNumber")} style={input} maxLength={12} /></Field>
          <Field label="Father's Mobile Number"><input value={form.fatherMobileNumber} onChange={update("fatherMobileNumber")} style={input} maxLength={10} /></Field>
          <Field label="Permanent Address"><input value={form.permanentAddress} onChange={update("permanentAddress")} style={input} /></Field>
          <Field label="Email (to receive certificate)"><input value={form.fatherEmail} onChange={update("fatherEmail")} style={input} /></Field>
          <Field label="Mother's Name"><input value={form.motherName} onChange={update("motherName")} style={input} /></Field>
          <Field label="Mother's Aadhar Number"><input value={form.motherAadharNumber} onChange={update("motherAadharNumber")} style={input} maxLength={12} /></Field>
          <Field label="Mother's Mobile Number"><input value={form.motherMobileNumber} onChange={update("motherMobileNumber")} style={input} maxLength={10} /></Field>
          <Field label="Child's Date of Birth"><input type="date" value={form.childBirthDate} onChange={update("childBirthDate")} style={input} /></Field>
          <Field label="Gender">
            <select value={form.childGender} onChange={update("childGender")} style={input}>
              <option value="">-- Select --</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </Field>
          <Field label="Place of Birth (Hospital Name / House Address / Other)"><input value={form.childBirthPlace} onChange={update("childBirthPlace")} style={input} /></Field>
          <Field label="Child's Full Name (Marathi)"><input value={form.childNameMarathi} onChange={update("childNameMarathi")} style={input} /></Field>
          <Field label="Child's Full Name (English)"><input value={form.childNameEnglish} onChange={update("childNameEnglish")} style={input} /></Field>
          <Field label="Applying for name registration after 15 years of birth?">
            <select value={form.isAppliedAfterFifteenYears} onChange={update("isAppliedAfterFifteenYears")} style={input}>
              <option value="">-- Select --</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </Field>
          {form.isAppliedAfterFifteenYears === "No" && (
            <Field label="Was the child's name already informed to the Corporation before?">
              <select value={form.navnondni} onChange={update("navnondni")} style={input}>
                <option value="">-- Select --</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </Field>
          )}
          {form.navnondni === "No" && (
            <Field label="Birth Report Number (जन्म अहवाल क्रमांक)"><input value={form.vartaNumber} onChange={update("vartaNumber")} style={input} /></Field>
          )}
          {message && <p style={{ color: "crimson" }}>{message}</p>}
          <button style={btn} onClick={handleFirstSubmit} disabled={busy}>{busy ? "Submitting..." : "Continue"}</button>
        </section>
      )}

      {phase === "documents" && (
        <section>
          <h3>Required Documents</h3>
          <p style={{ fontSize: 13, color: "#666" }}>
            Your entered details are now locked. Upload the documents below, then
            click "Upload &amp; Submit" to finish registration.
            {atLeastTwoRequired && " Upload at least two of the listed documents."}
          </p>
          {requiredDocuments.map((doc) => (
            <div key={doc.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>{doc.label}{doc.required ? " *" : ""}</span>
              {uploadedKeys[doc.key] ? (
                <span style={{ color: "green", fontWeight: 600 }}>{uploadedKeys[doc.key]}</span>
              ) : (
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleUpload(doc.key, e.target.files?.[0])} disabled={busy} />
              )}
            </div>
          ))}
          {message && <p style={{ color: "crimson" }}>{message}</p>}
          <button style={{ ...btn, marginTop: 16 }} onClick={handleFinalize} disabled={busy}>
            {busy ? "Submitting..." : "Upload & Submit"}
          </button>
        </section>
      )}

      {phase === "success" && (
        <section>
          <h3>Application Submitted Successfully</h3>
          <p>Your Application Number is:</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#0b3d91" }}>{finalApplicationNumber}</p>
          <p style={{ fontSize: 13, color: "#666" }}>
            An SMS with this number and an acknowledgement download link would be sent to your
            mobile (dummy mode: logged on the backend, not actually sent). A bill/challan download
            happens here in the legacy system — real PDF generation is on the migration checklist.
          </p>
          <a href={`/status/${finalApplicationNumber}`} style={btn}>Check Status</a>
        </section>
      )}
    </div>
  );
}

function PhaseIndicator({ phase }) {
  const steps = ["form", "documents", "success"];
  const labels = ["Fill Form", "Documents", "Done"];
  const idx = steps.indexOf(phase);
  return (
    <div style={{ display: "flex", gap: 8, margin: "16px 0 24px", fontSize: 13, flexWrap: "wrap" }}>
      {labels.map((l, i) => (
        <div key={l} style={{ color: i === idx ? "#0b3d91" : "#999", fontWeight: i === idx ? 700 : 400 }}>
          {i + 1}. {l} {i < labels.length - 1 ? " →" : ""}
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 14, marginBottom: 4, fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
      <span style={{ color: "#555" }}>{label}</span>
      <strong style={{ color: highlight ? "#0b3d91" : "#111" }}>{value}</strong>
    </div>
  );
}

const card = { background: "#fff", padding: 24, borderRadius: 8 };
const input = { width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 4, fontSize: 14 };
const btn = { background: "linear-gradient(110deg, #ad5288 0%, #762c70 52%, #42114f 100%)", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" };
const btnOutline = { border: "1px solid #0b3d91", color: "#0b3d91", background: "#fff", padding: "10px 20px", borderRadius: 6, fontWeight: 600, cursor: "pointer" };
