import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AppNotification,
  ApprovedDoctor,
  ChatMessage,
  Conversation,
  DoctorPatientRow,
  DoctorVerificationRow,
  MedicalRecord,
  MedicalRecordType,
  VerificationStatus,
} from "./types";

export async function listApprovedDoctors(client: SupabaseClient) {
  const { data, error } = await client
    .from("approved_doctors")
    .select("*")
    .order("full_name");
  if (error) throw error;
  return (data ?? []) as ApprovedDoctor[];
}

export async function listDoctorVerifications(
  client: SupabaseClient,
  status: VerificationStatus | "all" = "pending"
) {
  let query = client
    .from("doctor_profiles")
    .select(
      "*, profiles:user_id ( full_name, phone, email )"
    )
    .order("created_at", { ascending: false });

  if (status !== "all") {
    query = query.eq("verification_status", status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DoctorVerificationRow[];
}

export async function setDoctorVerification(
  client: SupabaseClient,
  doctorProfileId: string,
  status: Extract<VerificationStatus, "approved" | "rejected">,
  rejectionReason?: string
) {
  const {
    data: { user },
  } = await client.auth.getUser();

  const { data, error } = await client
    .from("doctor_profiles")
    .update({
      verification_status: status,
      rejection_reason: status === "rejected" ? rejectionReason ?? null : null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id ?? null,
    })
    .eq("id", doctorProfileId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unlockPatientFile(
  client: SupabaseClient,
  fileNumber: string
) {
  const { data, error } = await client.rpc("unlock_patient_by_file_number", {
    p_file_number: fileNumber,
  });
  if (error) throw error;
  return data as string;
}

export async function getSignedUrl(
  client: SupabaseClient,
  bucket: "doctor-credentials" | "medical-attachments",
  path: string,
  expiresIn = 60 * 10
) {
  const { data, error } = await client.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

export async function listMyConversations(client: SupabaseClient) {
  const { data, error } = await client.rpc("list_my_conversations");
  if (error) throw error;
  return (data ?? []) as Conversation[];
}

export async function listConversationMessages(
  client: SupabaseClient,
  conversationId: string
) {
  const { data, error } = await client.rpc("list_conversation_messages", {
    p_conversation_id: conversationId,
  });
  if (error) throw error;
  return (data ?? []) as ChatMessage[];
}

export async function sendMessage(
  client: SupabaseClient,
  conversationId: string,
  body: string
) {
  const { data, error } = await client.rpc("send_message", {
    p_conversation_id: conversationId,
    p_body: body,
  });
  if (error) throw error;
  return data as string;
}

export async function setPatientMessaging(
  client: SupabaseClient,
  patientId: string,
  enabled: boolean
) {
  const { data, error } = await client.rpc("set_patient_messaging", {
    p_patient_id: patientId,
    p_enabled: enabled,
  });
  if (error) throw error;
  return data as string;
}

export async function listMyNotifications(client: SupabaseClient) {
  const { data, error } = await client.rpc("list_my_notifications");
  if (error) throw error;
  return (data ?? []) as AppNotification[];
}

export async function markNotificationRead(
  client: SupabaseClient,
  notificationId: string
) {
  const { error } = await client.rpc("mark_notification_read", {
    p_id: notificationId,
  });
  if (error) throw error;
}

export async function registerPushToken(
  client: SupabaseClient,
  token: string,
  platform = "unknown"
) {
  const { data, error } = await client.rpc("register_push_token", {
    p_token: token,
    p_platform: platform,
  });
  if (error) throw error;
  return data as string;
}

export async function listMyDoctorPatients(client: SupabaseClient) {
  const { data, error } = await client.rpc("list_my_doctor_patients");
  if (error) throw error;
  return (data ?? []) as DoctorPatientRow[];
}

export async function listPatientMedicalRecords(
  client: SupabaseClient,
  patientId: string
) {
  const { data, error } = await client.rpc("list_patient_medical_records", {
    p_patient_id: patientId,
  });
  if (error) throw error;
  return (data ?? []) as MedicalRecord[];
}

export async function listMyMedicalRecords(client: SupabaseClient) {
  const { data, error } = await client.rpc("list_my_medical_records");
  if (error) throw error;
  return (data ?? []) as MedicalRecord[];
}

export async function createMedicalRecord(
  client: SupabaseClient,
  input: {
    patientId: string;
    recordType: MedicalRecordType;
    title: string;
    notes?: string | null;
    fileUrl?: string | null;
    occurredAt?: string;
  }
) {
  const { data, error } = await client.rpc("create_medical_record", {
    p_patient_id: input.patientId,
    p_record_type: input.recordType,
    p_title: input.title,
    p_notes: input.notes ?? null,
    p_file_url: input.fileUrl ?? null,
    p_occurred_at: input.occurredAt ?? null,
  });
  if (error) throw error;
  return data as string;
}
