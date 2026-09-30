"use client";

import { useEffect, useState } from "react";
import { api, auth } from "./api/client";

// Maps legacy Login_Module/LoginPageNew.aspx: username/password login, role fetched from the
// server for the Clerk portal.

export default function App() {
  // Browser storage is intentionally retained from the React version.  Deferring the
  // initial read makes the same client-only session flow safe during Next.js rendering.
  const [session, setSession] = useState(null);

  useEffect(() => {
    setSession(auth.getSession());
  }, []);

  if (!session) {
    return <LoginScreen onLoggedIn={setSession} />;
  }

  return <ApplicationQueue session={session} onLogout={() => { auth.clearSession(); setSession(null); }} />;
}

function LoginScreen({ onLoggedIn }) {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api.login(userName, password);
      auth.saveSession(result);
      onLoggedIn(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 380, margin: "80px auto", background: "#fff", padding: 32, borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
      <h1 style={{ color: "#0b3d91", fontSize: 22 }}>BDMS Clerk Login</h1>
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginTop: 16, fontSize: 14, fontWeight: 600 }}>User Name</label>
        <input value={userName} onChange={(e) => setUserName(e.target.value)} style={input} autoFocus />
        <label style={{ display: "block", marginTop: 12, fontSize: 14, fontWeight: 600 }}>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} />
        {error && <p style={{ color: "crimson", fontSize: 13 }}>{error}</p>}
        <button type="submit" disabled={busy} style={{ ...btn, width: "100%", marginTop: 20 }}>
          {busy ? "Signing in..." : "Login"}
        </button>
      </form>
      <p style={{ fontSize: 12, color: "#888", marginTop: 20 }}>
        Demo account (seeded on first backend run): <code>clerk1 / Clerk@123</code>.
      </p>
    </div>
  );
}

// Maps EditBDMS.aspx -- the real queue list, with the same columns and date-range search
// filters seen live, instead of the earlier simplified table.
function ApplicationQueue({ session, onLogout }) {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState("");
  const [reviewingApp, setReviewingApp] = useState(null); // { applicationNumber, detail } currently open in the verification panel
  const [certificateType, setCertificateType] = useState("birth");

  const [entryDateFrom, setEntryDateFrom] = useState("");
  const [entryDateTo, setEntryDateTo] = useState("");
  const [childBirthDateFrom, setChildBirthDateFrom] = useState("");
  const [childBirthDateTo, setChildBirthDateTo] = useState("");

  async function load(overrides = {}) {
    try {
      setApps(certificateType === "death" ? await api.listDeathApplications() : await api.listApplications({
        entryDateFrom, entryDateTo, childBirthDateFrom, childBirthDateTo, ...overrides,
      }));
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { load(); }, [certificateType]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleClear() {
    setEntryDateFrom(""); setEntryDateTo(""); setChildBirthDateFrom(""); setChildBirthDateTo("");
    load({ entryDateFrom: "", entryDateTo: "", childBirthDateFrom: "", childBirthDateTo: "" });
  }

  async function handleOpenForReview(appNumber) {
    setError("");
    try {
      const detail = certificateType === "death" ? await api.openDeathForReview(appNumber) : await api.openForReview(appNumber);
      setReviewingApp({ applicationNumber: appNumber, detail, type: certificateType });
    } catch (e) { setError(e.message); }
  }

  function handleClosedReview() {
    setReviewingApp(null);
    load();
  }

  if (reviewingApp) {
    return reviewingApp.type === "death" ? <DeathVerificationScreen applicationNumber={reviewingApp.applicationNumber} initialDetail={reviewingApp.detail} onDone={handleClosedReview} /> : <VerificationScreen applicationNumber={reviewingApp.applicationNumber} initialDetail={reviewingApp.detail} onDone={handleClosedReview} />;
  }

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 1200, margin: "24px auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ color: "#0b3d91" }}>BDMS -- Clerk Portal</h1>
        <div>
          <span style={{ marginRight: 12 }}>Signed in as <strong>{session.userName}</strong></span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </header>

      <div style={{ background: "#fff", padding: 16, borderRadius: 8, marginBottom: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "end" }}>
        <label>Certificate Type <select value={certificateType} onChange={(e) => setCertificateType(e.target.value)}><option value="birth">Birth Certificate</option><option value="death">Death Certificate</option></select></label>
        <DateField label="Entry Date From" value={entryDateFrom} onChange={setEntryDateFrom} />
        <DateField label="Entry Date To" value={entryDateTo} onChange={setEntryDateTo} />
        <DateField label="Child Birth Date From" value={childBirthDateFrom} onChange={setChildBirthDateFrom} />
        <DateField label="Child Birth Date To" value={childBirthDateTo} onChange={setChildBirthDateTo} />
        <button style={btn} onClick={() => load()}>Search</button>
        <button onClick={handleClear}>Clear</button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
        <thead>
          <tr style={{ background: "#333", color: "#fff", textAlign: "left" }}>
            <Th>Select</Th>
            <Th>अ. क्र.</Th>
            <Th>Application Number</Th>
            <Th>Cert Uploaded Status</Th>
            <Th>{certificateType === "death" ? "Death Place" : "Birth Place"}</Th>
            <Th>{certificateType === "death" ? "Death Date" : "Child Birth Date"}</Th>
            <Th>{certificateType === "death" ? "Deceased Person" : "Child Name"}</Th>
            <Th>{certificateType === "death" ? "Applicant" : "Father Name"}</Th>
            <Th>{certificateType === "death" ? "Father/Husband" : "Mother Name"}</Th>
            <Th>Mobile Number</Th>
            <Th>Address</Th>
            <Th>Application Status</Th>
          </tr>
        </thead>
        <tbody>
          {apps.map((a, i) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
              <Td><button onClick={() => handleOpenForReview(a.applicationNumber)}>Select</button></Td>
              <Td>{i + 1}</Td>
              <Td>{a.applicationNumber}</Td>
              <Td>{a.certUploadedStatus}</Td>
              <Td>{a.deathPlace || a.childBirthPlace}</Td>
              <Td>{new Date(a.deathDate || a.childBirthDate).toLocaleDateString("en-GB")}</Td>
              <Td>{a.deadPersonName || a.childNameEnglish}</Td>
              <Td>{a.applicantName || a.fatherName}</Td>
              <Td>{a.fatherHusbandName || a.motherName}</Td>
              <Td>{a.applicantMobileNumber || a.fatherMobileNumber || a.motherMobileNumber}</Td>
              <Td>{a.permanentAddress}</Td>
              <Td>{a.verifiedApplicationStatus}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeathVerificationScreen({ applicationNumber, initialDetail, onDone }) {
  const [recordFound, setRecordFound] = useState(initialDetail.recordFound || "Pending");
  const [regNo, setRegNo] = useState(initialDetail.crsMainetRegNo || "");
  const [source, setSource] = useState(initialDetail.crsMainetSourceValue || "NotSelected");
  const [registeredDeathDate, setRegisteredDeathDate] = useState(toDateInputValue(initialDetail.registeredDeathDate));
  const [remark, setRemark] = useState(initialDetail.operatorRemark || "");
  const [uploaded, setUploaded] = useState(false), [error, setError] = useState(""), [busy, setBusy] = useState(false);
  async function cancel() { try { await api.releaseDeathLock(applicationNumber); } finally { onDone(); } }
  async function submit() { setBusy(true); setError(""); try { await api.verifyDeath(applicationNumber, { recordFound, crsMainetRegNo: regNo || null, crsMainetSourceValue: source, registeredChildBirthDate: registeredDeathDate || null, remark, signedCertificateUploaded: uploaded }); onDone(); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  const showCrsPanel = recordFound !== "SubRegistrar";
  return <div style={{ fontFamily:"system-ui, sans-serif", maxWidth:900, margin:"24px auto" }}>
    <div style={card}>
      <h1 style={{ color:"#0b3d91", fontSize:20 }}>Death Registration Verification - {applicationNumber}</h1>
      <div style={{ fontWeight:700, margin:"18px 0 10px" }}>Citizen-submitted application details</div>
      <FormRow><FormCell label="Applicant Name" value={initialDetail.applicantName} /><FormCell label="Applicant Aadhaar Number" value={initialDetail.applicantAadharNumber} /><FormCell label="Applicant Mobile Number" value={initialDetail.applicantMobileNumber} /></FormRow>
      <FormRow><FormCell label="Permanent Address" value={initialDetail.permanentAddress} /><FormCell label="Email to Receive Certificate" value={initialDetail.email} /></FormRow>
      <hr style={{ border:"none", borderTop:"1px solid #dbe6f0", margin:"14px 0" }} />
      <FormRow><FormCell label="Dead Person Name" value={initialDetail.deadPersonName} /><FormCell label="Gender" value={initialDetail.gender} /><FormCell label="Death Date" value={new Date(initialDetail.deathDate).toLocaleDateString("en-GB")} /></FormRow>
      <FormRow><FormCell label="Death Place" value={initialDetail.deathPlace} /><FormCell label="Dead Person Aadhaar Number" value={initialDetail.deadPersonAadharNumber} /></FormRow>
      <FormRow><FormCell label="Mother Name" value={initialDetail.motherName} /><FormCell label="Father/Husband Name" value={initialDetail.fatherHusbandName} /></FormRow>
      <DocumentTable documents={initialDetail.uploadedDocuments} applicationNumber={applicationNumber} />
    </div>
    <div style={{ ...card, marginTop:16 }}>
      <div style={{ fontWeight:700, marginBottom:8 }}>CRS - Mainet Verification Details</div>
      <Field label="Record Found"><select value={recordFound} onChange={(e)=>setRecordFound(e.target.value)} style={selectInput}><option value="Pending">PENDING</option><option value="Yes">YES</option><option value="No">NO</option><option value="Abhilekhapal">ABHILEKHAPAL</option><option value="SubRegistrar">SUBREGISTRAR</option></select></Field>
      <Field label="CRS - Mainet Reg. No."><input value={regNo} onChange={(e)=>setRegNo(e.target.value)} disabled={recordFound === "No"} style={{ ...selectInput, cursor: recordFound === "No" ? "not-allowed" : "text", opacity: recordFound === "No" ? 0.7 : 1 }} /></Field>
      {showCrsPanel && <><Field label="From CRS - Mainet"><select value={source} onChange={(e)=>setSource(e.target.value)} disabled={recordFound === "No"} style={selectInput}><option value="NotSelected">-- SELECT --</option><option value="CRS">CRS</option><option value="Mainet">MAINET</option></select></Field><Field label="Registered Death Date"><input type="date" value={registeredDeathDate} onChange={(e)=>setRegisteredDeathDate(e.target.value)} style={selectInput} /></Field></>}
      <Field label="Operator Remark"><input value={remark} onChange={(e)=>setRemark(e.target.value)} style={selectInput} /></Field>
      {showCrsPanel && <div style={{ marginTop:16, border:"1px solid #dbe6f0", padding:12 }}><div style={{ fontWeight:700, marginBottom:8 }}>Upload Documents</div><label><input type="checkbox" checked={uploaded} onChange={(e)=>setUploaded(e.target.checked)} /> Death certificate / death record uploaded</label></div>}
      {error && <p style={{ color:"crimson" }}>{error}</p>}<div style={{ marginTop:16, display:"flex", gap:12 }}><button style={btn} disabled={busy || recordFound === "Pending"} onClick={submit}>Submit Verification</button><button onClick={cancel}>Cancel (release lock)</button></div>
    </div>
  </div>;
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600 }}>{label}</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: 8, border: "1px solid #ccc", borderRadius: 4 }} />
    </div>
  );
}

// Maps BDMS_Page.aspx -- the real officer/clerk verification screen (CRS -Mainet cross-check),
// replacing the old placeholder Approve/Reject buttons.
function VerificationScreen({ applicationNumber, initialDetail, onDone }) {
  const [detail] = useState(initialDetail);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // "Pending" is the real default -- matches the live dropdown, not a blank placeholder.
  const [recordFound, setRecordFound] = useState(detail?.recordFound || "Pending");
  const [crsMainetRegNo, setCrsMainetRegNo] = useState(detail?.crsMainetRegNo || "");
  const [crsMainetSource, setCrsMainetSource] = useState(detail?.crsMainetSourceValue || "SELECT");
  const [isNamePreviouslyReportedOperatorVerified, setIsNamePreviouslyReportedOperatorVerified] = useState(
    detail?.isNamePreviouslyReportedOperatorVerified || "SELECT"
  );
  const [registeredChildBirthDate, setRegisteredChildBirthDate] = useState(toDateInputValue(detail?.registeredChildBirthDate));
  const [registeredChildName, setRegisteredChildName] = useState(detail?.registeredChildName || "");
  const [operatorRemark, setOperatorRemark] = useState(detail?.operatorRemark || "");
  const [certificateFile, setCertificateFile] = useState(null);

  useEffect(() => {
    if (!detail) setError("Could not load application detail.");
  }, [detail]);

  async function handleCancel() {
    try { await api.releaseLock(applicationNumber); } catch (_) { /* best-effort */ }
    onDone();
  }

  function handleRecordFoundChange(nextValue) {
    setRecordFound(nextValue);
  }

  function handlePreviouslyReportedChange(nextValue) {
    setIsNamePreviouslyReportedOperatorVerified(nextValue);
    if (nextValue === "NO") {
      setRegisteredChildBirthDate(toDateInputValue(detail?.childBirthDate));
      setRegisteredChildName(detail?.childNameEnglish || "");
    } else if (nextValue === "YES") {
      setRegisteredChildBirthDate("");
      setRegisteredChildName("");
    }
  }

  async function handleSubmit() {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const isRecordFoundYes = recordFound === "Yes";
      const normalizedRegisteredChildBirthDate = isNamePreviouslyReportedOperatorVerified === "NO"
        ? toDateInputValue(detail?.childBirthDate)
        : registeredChildBirthDate;
      const normalizedRegisteredChildName = isNamePreviouslyReportedOperatorVerified === "NO"
        ? detail?.childNameEnglish || ""
        : registeredChildName;

      if (isRecordFoundYes) {
        if (!crsMainetRegNo.trim()) throw new Error("Please enter CRS or Mainet Registration Number.");
        if (crsMainetSource === "SELECT") throw new Error("Please select record found in CRS or net.");
        if (isNamePreviouslyReportedOperatorVerified === "SELECT") {
          throw new Error("Please select - याआधी बाळाचे नाव महापालिकेस कळविले आहे का ?");
        }
        if (/[@#$!%^&*]/.test(operatorRemark)) {
          throw new Error("Please enter valid remark.");
        }
        if (!certificateFile) throw new Error("Please select the issued birth certificate file.");
        if (isNamePreviouslyReportedOperatorVerified === "YES") {
          if (!normalizedRegisteredChildBirthDate) throw new Error("Please select Child Birth Registered date.");
          if (!normalizedRegisteredChildName.trim()) throw new Error("Please enter Registered Child Name.");
        }
      }

      if (isRecordFoundYes) await api.uploadIssuedCertificate(applicationNumber, certificateFile);
      const result = await api.verify(applicationNumber, {
        recordFound,
        crsMainetRegNo: isRecordFoundYes ? crsMainetRegNo : null,
        crsMainetSourceValue: isRecordFoundYes ? crsMainetSource : "NotSelected",
        isNamePreviouslyReportedOperatorVerified: isRecordFoundYes ? isNamePreviouslyReportedOperatorVerified : "NotSelected",
        registeredChildBirthDate: isRecordFoundYes ? normalizedRegisteredChildBirthDate : null,
        registeredChildName: isRecordFoundYes ? normalizedRegisteredChildName : null,
        remark: operatorRemark,
        signedCertificateUploaded: Boolean(certificateFile),
      });
      setMessage(result.message);
      setTimeout(onDone, 1200);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!detail) return <div style={card}><p>Loading...</p></div>;

  const showCrsPanel = recordFound !== "SubRegistrar";
  const nameReportedFieldsEnabled = showCrsPanel && isNamePreviouslyReportedOperatorVerified !== "SELECT";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "24px auto" }}>
      <div style={{ ...card, border: "1px solid #dbe6f0", boxShadow: "0 2px 10px rgba(11,61,145,0.06)" }}>
        <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5f7490" }}>Birth Registration Verification</div>
          <h1 style={{ color: "#0b3d91", fontSize: 20, margin: "4px 0 0" }}>Clerk Verification — {applicationNumber}</h1>
        </div>
        <CitizenFormReadOnly detail={detail} />
        <DocumentTable documents={detail.uploadedDocuments} applicationNumber={applicationNumber} />
      </div>

      <div style={{ ...card, marginTop: 16, border: "1px solid #dbe6f0", boxShadow: "0 2px 10px rgba(11,61,145,0.06)" }}>
        <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#5f7490" }}>Verification Details</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#243b53", marginTop: 4 }}>Official Review Panel</div>
        </div>
        <Field label="Record Found">
          <select value={recordFound} onChange={(e) => handleRecordFoundChange(e.target.value)} style={selectInput}>
            <option value="Pending">PENDING</option>
            <option value="Yes">YES</option>
            <option value="No">NO</option>
            <option value="Abhilekhapal">ABHILEKHAPAL</option>
            <option value="SubRegistrar">SUBREGISTRAR</option>
          </select>
        </Field>

        {recordFound === "SubRegistrar" && (
          <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>
            Routed to Sub-Registrar -- no further fields needed on this screen (matches legacy shortcut).
          </p>
        )}

        <Field label="CRS/Mainet Reg. No.">
          <input
            value={crsMainetRegNo}
            onChange={(e) => setCrsMainetRegNo(e.target.value)}
            disabled={recordFound === "No"}
            style={{ ...selectInput, cursor: recordFound === "No" ? "not-allowed" : "text", opacity: recordFound === "No" ? 0.7 : 1 }}
          />
        </Field>

        {showCrsPanel && (
          <>
            <Field label="From CRS/Mainet">
              <select value={crsMainetSource} onChange={(e) => setCrsMainetSource(e.target.value)} disabled={recordFound === "No"} style={selectInput}>
                <option value="SELECT">-- SELECT --</option>
                <option value="CRS">CRS</option>
                <option value="Mainet">MAINET</option>
              </select>
            </Field>
            <Field label="याआधी बाळाचे नाव महापालिकेस कळविले आहे का ?">
              <select value={isNamePreviouslyReportedOperatorVerified} onChange={(e) => handlePreviouslyReportedChange(e.target.value)} disabled={recordFound === "Pending"} style={selectInput}>
                <option value="SELECT">-- SELECT --</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </Field>
            <Field label="बाळाचे नाव रजिस्टर केलेले दिनांक">
              <input type="date" value={registeredChildBirthDate} onChange={(e) => setRegisteredChildBirthDate(e.target.value)} disabled={!nameReportedFieldsEnabled} style={selectInput} />
            </Field>
            <Field label="रजिस्टर केलेले बाळाचे नाव">
              <input value={registeredChildName} onChange={(e) => setRegisteredChildName(e.target.value)} disabled={!nameReportedFieldsEnabled} style={selectInput} />
            </Field>
          </>
        )}

        <Field label="Operator Remark">
          <input value={operatorRemark} onChange={(e) => setOperatorRemark(e.target.value)} style={selectInput} />
        </Field>

        {showCrsPanel && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>अपलोड कागदपत्रे</div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f0f0f0" }}><Th>अ.क्र.</Th><Th>कागदपत्राचे नाव</Th><Th>निवडा</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td>1</Td>
                  <Td>जन्म दाखला</Td>
                  <Td>
                    <label>
                      <input type="file" accept="application/pdf,image/*" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} />
                      {certificateFile && <span style={{ marginLeft: 8 }}>{certificateFile.name}</span>}
                    </label>
                  </Td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p style={{ color: "crimson" }}>{error}</p>}

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button style={btn} onClick={handleSubmit} disabled={busy || recordFound === "Pending"}>
            {busy ? "Saving..." : "Submit Verification"}
          </button>
          <button onClick={handleCancel} disabled={busy} style={{ padding: "10px 16px", borderRadius: 6, border: "1px solid #cbd5e1", background: "#f8fafc", cursor: "pointer" }}>Cancel (release lock)</button>
        </div>
      </div>
    </div>
  );
}

// Read-only reproduction of the citizen's original "जन्म दाखला मिळण्याबाबत नमुना अर्ज" form,
// shown to the officer for context -- same field groupings as the live form. Deliberately
// excludes any fee/payment amount: legacy's verification screen doesn't show one either,
// and payment only ever happens after approval (a separate, not-yet-built module).
function CitizenFormReadOnly({ detail }) {
  return (
    <div style={{ background: "#eaf4ff", border: "1px solid #cfe3f7", borderRadius: 8, padding: 16, marginTop: 16 }}>
      <div style={{ fontWeight: 700, marginBottom: 12 }}>जन्म दाखला मिळण्याबाबत नमुना अर्ज (Citizen-submitted, read-only)</div>
      <FormRow>
        <FormCell label="वडिलांचे नाव" value={detail.fatherName} />
        <FormCell label="वडिलांचे आधार क्रमांक" value={detail.fatherAadharNumber} />
        <FormCell label="वडिलांचे मोबाईल क्रमांक" value={detail.fatherMobileNumber} />
      </FormRow>
      <FormRow>
        <FormCell label="कायमचा पत्ता" value={detail.permanentAddress} />
        <FormCell label="जन्म दाखला ज्यावर पाहिजे तो इमेल" value={detail.fatherEmail} />
      </FormRow>
      <hr style={{ border: "none", borderTop: "1px solid #b3d4f0", margin: "12px 0" }} />
      <FormRow>
        <FormCell label="आईचे नाव" value={detail.motherName} />
        <FormCell label="आईचे आधार क्रमांक" value={detail.motherAadharNumber} />
        <FormCell label="आईचे मोबाईल क्रमांक" value={detail.motherMobileNumber} />
      </FormRow>
      <hr style={{ border: "none", borderTop: "1px solid #b3d4f0", margin: "12px 0" }} />
      <FormRow>
        <FormCell label="बाळाचा जन्म दिनांक" value={new Date(detail.childBirthDate).toLocaleDateString("en-GB")} />
        <FormCell label="लिंग" value={detail.childGender} />
        <FormCell label="जन्म ठिकाण" value={detail.childBirthPlace} />
      </FormRow>
      <FormRow>
        <FormCell label="जन्मतारखे पासून १५ वर्षे वय नंतर नाव नोंदवायचे आहेत का ?" value={detail.isAppliedAfterFifteenYears} />
        <FormCell label="याआधी बाळाचे नाव महापालिकेस कळविले आहे का ?" value={detail.navnondni} />
      </FormRow>
      <hr style={{ border: "none", borderTop: "1px solid #b3d4f0", margin: "12px 0" }} />
      <FormRow>
        <FormCell label="बाळाचे नाव (मराठी)" value={detail.childNameMarathi} />
        <FormCell label="बाळाचे नाव (इंग्लिश)" value={detail.childNameEnglish} />
      </FormRow>
      <FormRow>
        <FormCell label="जन्म अहवाल क्रमांक" value={detail.vartaNumber} />
        <FormCell label="अर्जाचा प्रकार" value={detail.ackSubject} />
      </FormRow>
    </div>
  );
}

function DocumentTable({ documents, applicationNumber }) {
  if (!documents || documents.length === 0) return null;
  async function openDocument(document) {
    if (!document.downloadUrl) return;
    try {
      const blob = await api.downloadDocument(document.downloadUrl);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      window.alert(error.message);
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr style={{ background: "#f0f0f0" }}><Th>#</Th><Th>Document</Th><Th></Th></tr></thead>
        <tbody>
          {documents.map((d, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
              <Td>{i + 1}</Td>
              <Td>{d.fileName}</Td>
              <Td>{d.isAcknowledgement ? "View" : d.downloadUrl ? <button onClick={() => openDocument(d)} style={{ color: "#0b3d91", background: "none", border: "none", cursor: "pointer", padding: 0 }}>View</button> : <span style={{ color: "#777" }}>No file stored</span>}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FormRow({ children }) {
  return <div style={{ display: "flex", gap: 24, marginBottom: 10, flexWrap: "wrap" }}>{children}</div>;
}
function FormCell({ label, value }) {
  return (
    <div style={{ flex: "1 1 200px" }}>
      <div style={{ fontSize: 12, fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 14 }}>{value || "--"}</div>
    </div>
  );
}

function formatYesNo(value) {
  if (value === true || value === "Yes" || value === "YES") return "YES";
  if (value === false || value === "No" || value === "NO") return "NO";
  return "--";
}

function toDateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function Th({ children }) { return <th style={{ padding: 10 }}>{children}</th>; }
function Td({ children }) { return <td style={{ padding: 10 }}>{children}</td>; }
function Field({ label, children }) {
  return (
    <div style={{ marginTop: 12 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 4, color: "#334155" }}>{label}</label>
      {children}
    </div>
  );
}
function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #eee" }}>
      <span style={{ color: "#333" }}>{label}</span>
      <strong>{value || "--"}</strong>
    </div>
  );
}

const card = { background: "#fff", padding: 24, borderRadius: 10 };
const input = { width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, marginTop: 4, background: "#f8fafc" };
const selectInput = { width: "100%", padding: 9, border: "1px solid #cbd5e1", borderRadius: 6, fontSize: 14, background: "#f8fafc" };
const btn = { background: "linear-gradient(110deg, #ad5288 0%, #762c70 52%, #42114f 100%)", color: "#fff", padding: "10px 20px", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 6px rgba(118,44,112,0.22)" };
