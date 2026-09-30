"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:7001";

export default function StatusPage({ params }) {
  const { applicationNumber } = params;
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  useEffect(() => {
    (applicationNumber.startsWith("DCE") ? api.death.getStatus(applicationNumber) : api.getStatus(applicationNumber)).then(setData).catch((e) => setError(e.message));
  }, [applicationNumber]);

  if (error) return <div style={card}><p style={{ color: "crimson" }}>{error}</p></div>;
  if (!data) return <div style={card}><p>Loading...</p></div>;

  const isBirthApplication = !data.deadPersonName;
  const isApproved = data.verifiedApplicationStatus === "Approved" || data.verifiedApplicationStatus === 1;
  const isPaid = data.paymentMadeYesNo === "Yes" || data.paymentMadeYesNo === 1;
  const canPay = isBirthApplication && isApproved && !isPaid;
  const canDownload = isBirthApplication && isApproved && isPaid;

  async function payNow() {
    setPaymentError("");
    setIsPaying(true);
    try {
      const initiated = await api.initiatePayment(data.applicationNumber);
      const confirmed = await api.confirmPayment(initiated.transactionId);
      if (confirmed.transactionStatus !== "Success") throw new Error("Payment could not be completed. Please try again.");
      setData((current) => ({ ...current, paymentMadeYesNo: "Yes" }));
    } catch (e) {
      setPaymentError(e.message || "Payment could not be completed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <div style={card}>
      <h1>Application Receipt / Status</h1>
      <Row label="Application Number" value={data.applicationNumber} />
      {data.deadPersonName ? <>
        <Row label="Deceased Person" value={data.deadPersonName} />
        <Row label="Date of Death" value={new Date(data.deathDate).toLocaleDateString()} />
        <Row label="Applicant" value={data.applicantName} />
      </> : <>
        <Row label="Child Name" value={data.childNameEnglish} />
        <Row label="Date of Birth" value={new Date(data.childBirthDate).toLocaleDateString()} />
        <Row label="Father's Name" value={data.fatherName} />
        <Row label="Mother's Name" value={data.motherName} />
      </>}
      {data.showAmount && data.amountToPay != null && (
        <Row label="Amount Paid" value={`₹ ${data.amountToPay}`} />
      )}
      <Row label="Payment Status" value={data.paymentMadeYesNo} />
      <Row label="Application Status" value={data.verifiedApplicationStatus} highlight />
      <Row label="Submitted On" value={new Date(data.entryDate).toLocaleString()} />
      {canPay && <section style={paymentCard}>
        <h2 style={{ marginTop: 0 }}>Payment</h2>
        <Row label="Certificate Fee" value={`₹ ${data.dakhalaFee ?? 0}`} />
        <Row label="Penalty" value={`₹ ${data.penalty ?? 0}`} />
        <Row label="Total Payable" value={`₹ ${data.amountToPay ?? 0}`} highlight />
        {paymentError && <p style={{ color: "crimson" }}>{paymentError}</p>}
        <button onClick={payNow} disabled={isPaying} style={button}>{isPaying ? "Processing payment..." : "Pay Now"}</button>
      </section>}
      {canDownload && <section style={paymentCard}>
        <h2 style={{ marginTop: 0, color: "#177245" }}>Payment Successful</h2>
        <p>Your payment has been received. Your certificate is ready to download.</p>
        <a href={`${API_BASE}/api/birth-applications/${encodeURIComponent(data.applicationNumber)}/certificate`} style={downloadLink}>Download Certificate</a>
      </section>}
      <p style={{ marginTop: 24, fontSize: 13, color: "#666" }}>
        Certificate download is available only after approval and successful payment.
        here (maps legacy <code>BDMS_Page_Online_Print.aspx</code> — next module in the
        migration checklist).
      </p>
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
const paymentCard = { marginTop: 24, padding: 16, border: "1px solid #cfe4d4", borderRadius: 8, background: "#f7fcf8" };
const button = { marginTop: 16, padding: "10px 18px", border: 0, borderRadius: 4, background: "linear-gradient(110deg, #ad5288 0%, #762c70 52%, #42114f 100%)", color: "#fff", cursor: "pointer" };
const downloadLink = { display: "inline-block", padding: "10px 18px", borderRadius: 4, background: "#177245", color: "#fff", textDecoration: "none" };
