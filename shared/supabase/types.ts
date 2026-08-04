export type UserRole = "patient" | "doctor" | "superadmin";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "declined"
  | "cancelled";
export type MedicalRecordType =
  | "visit"
  | "medication"
  | "surgery"
  | "scan"
  | "eco"
  | "other";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  specialty: string;
  license_url: string | null;
  id_doc_url: string | null;
  verification_status: VerificationStatus;
  rejection_reason: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  bio: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  file_number: string;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorSlot {
  id: string;
  doctor_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  slot_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string | null;
  reason: string | null;
  status: AppointmentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  created_by_doctor_id: string | null;
  record_type: MedicalRecordType;
  title: string;
  notes: string | null;
  file_url: string | null;
  occurred_at: string;
  created_at: string;
}

export type SenderRole = "doctor" | "patient";
export type NotificationType = "appointment" | "message" | "access" | "record";

export interface Conversation {
  id: string;
  doctor_id: string;
  patient_id: string;
  messaging_enabled: boolean;
  peer_name: string;
  peer_specialty: string | null;
  last_message: string | null;
  last_message_at: string | null;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_role: SenderRole;
  sender_user_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface DoctorPatientAccess {
  id: string;
  doctor_id: string;
  patient_id: string;
  file_number_used: string;
  granted_at: string;
  expires_at: string;
}

export interface DoctorPatientRow {
  patient_id: string;
  patient_name: string;
  patient_phone: string | null;
  file_number: string | null;
  has_access: boolean;
  access_expires_at: string | null;
  messaging_enabled: boolean;
  conversation_id: string | null;
  last_appointment_date: string | null;
  last_appointment_status: AppointmentStatus | null;
}

export interface ApprovedDoctor {
  id: string;
  specialty: string;
  bio: string | null;
  location: string | null;
  full_name: string;
  phone: string | null;
}

export interface DoctorVerificationRow extends DoctorProfile {
  profiles: Pick<Profile, "full_name" | "phone" | "email"> | null;
}

export const SPECIALTIES = [
  "Dermatologist",
  "Cardiologist",
  "General Practitioner",
  "Pediatrician",
  "Orthopedist",
  "Neurologist",
  "Gynecologist",
  "ENT",
  "Ophthalmologist",
  "Other",
] as const;

export type Specialty = (typeof SPECIALTIES)[number];
