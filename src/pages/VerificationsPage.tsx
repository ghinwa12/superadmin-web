import { useEffect, useState } from "react";
import type { DoctorVerificationRow, VerificationStatus } from "@shared/types";
import { fetchVerifications, signedCredentialUrl, updateVerification } from "../lib/api";

const FILTERS: Array<VerificationStatus | "all"> = [
  "pending",
  "approved",
  "rejected",
  "all",
];

export function VerificationsPage() {
  const [filter, setFilter] = useState<VerificationStatus | "all">("pending");
  const [rows, setRows] = useState<DoctorVerificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchVerifications(filter));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [filter]);

  const openDoc = async (path: string | null) => {
    try {
      const url = await signedCredentialUrl(path);
      if (!url) {
        window.alert("No document uploaded.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not open file");
    }
  };

  const approve = async (id: string) => {
    setBusyId(id);
    try {
      await updateVerification(id, "approved");
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Approve failed");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (id: string) => {
    const reason = window.prompt("Rejection reason (shown to the doctor):");
    if (reason === null) return;
    setBusyId(id);
    try {
      await updateVerification(id, "rejected", reason.trim() || "Rejected by admin");
      await load();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Doctor verifications</h1>
      <p className="page-sub">
        Review license and ID documents, then approve or reject each doctor.
      </p>

      <div className="row filters" style={{ marginBottom: 16 }}>
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            className={`btn secondary ${filter === item ? "active" : ""}`}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        {loading ? (
          <p>Loading…</p>
        ) : rows.length === 0 ? (
          <p>No doctors in this filter.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Status</th>
                <th>Documents</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.profiles?.full_name ?? "Unknown"}</strong>
                    <div style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                      {row.profiles?.email}
                      {row.profiles?.phone ? ` · ${row.profiles.phone}` : ""}
                    </div>
                  </td>
                  <td>{row.specialty}</td>
                  <td>
                    <span className={`badge ${row.verification_status}`}>
                      {row.verification_status}
                    </span>
                    {row.rejection_reason && (
                      <div style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: 6 }}>
                        {row.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td className="doc-links">
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => openDoc(row.license_url)}
                    >
                      License
                    </button>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => openDoc(row.id_doc_url)}
                    >
                      ID
                    </button>
                  </td>
                  <td>
                    <div className="row">
                      <button
                        type="button"
                        className="btn"
                        disabled={busyId === row.id || row.verification_status === "approved"}
                        onClick={() => approve(row.id)}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="btn danger"
                        disabled={busyId === row.id || row.verification_status === "rejected"}
                        onClick={() => reject(row.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
