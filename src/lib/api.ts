import type {
  DoctorVerificationRow,
  VerificationStatus,
} from "@shared/types";
import { supabase } from "./supabase";

export async function fetchVerifications(
  status: VerificationStatus | "all"
): Promise<DoctorVerificationRow[]> {
  let query = supabase
    .from("doctor_profiles")
    .select("*, profiles:user_id ( full_name, phone, email )")
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("verification_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DoctorVerificationRow[];
}

export async function updateVerification(
  id: string,
  status: Extract<VerificationStatus, "approved" | "rejected">,
  rejectionReason?: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("doctor_profiles")
    .update({
      verification_status: status,
      rejection_reason: status === "rejected" ? rejectionReason ?? null : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id ?? null,
    })
    .eq("id", id);

  if (error) throw error;
}

export async function signedCredentialUrl(pathOrUrl: string | null) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith("http")) return pathOrUrl;

  const { data, error } = await supabase.storage
    .from("doctor-credentials")
    .createSignedUrl(pathOrUrl, 60 * 10);

  if (error) throw error;
  return data.signedUrl;
}
