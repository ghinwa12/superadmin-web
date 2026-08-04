import { useEffect, useState } from "react";
import type { DoctorVerificationRow } from "@shared/types";
import { fetchVerifications } from "../lib/api";

export function DoctorsListPage() {
  const [rows, setRows] = useState<DoctorVerificationRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications("all")
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="page-title">All doctors</h1>
      <p className="page-sub">Approved, pending, and rejected accounts.</p>
      {error && <div className="error">{error}</div>}
      <div className="card">
        {loading ? (
          <p>Loading…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialty</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.profiles?.full_name ?? "Unknown"}</td>
                  <td>{row.specialty}</td>
                  <td>{row.location ?? "—"}</td>
                  <td>
                    <span className={`badge ${row.verification_status}`}>
                      {row.verification_status}
                    </span>
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
