/**
 * System 001: Official Correspondence (ระบบงานสารบรรณอิเล็กทรอนิกส์)
 * Domain-specific type definitions.
 */

export type DocumentUrgency = "normal" | "urgent" | "very_urgent" | "most_urgent";

export type DocumentStatus = "received" | "routing" | "signed" | "completed";

export type DocumentCategory = "external" | "internal" | "order" | "announcement";

export interface OfficialDocument {
  id: string;
  document_number: string; // e.g. "พจ ๐๐๒๓.๒/ว ๑๐๔"
  title: string;           // เรื่อง
  sender: string;          // จากหน่วยงาน
  recipient: string;       // ถึง
  date_received: string;   // วันที่ลงรับ
  category: DocumentCategory;
  urgency: DocumentUrgency;
  status: DocumentStatus;
  notes?: string;
  created_at: string;
}
