import type { DocumentUrgency, DocumentStatus, DocumentCategory } from "../types/document";

export const URGENCY_LABELS: Record<DocumentUrgency, { label: string; variant: "default" | "warning" | "danger" | "info" }> = {
  normal: { label: "ปกติ", variant: "default" },
  urgent: { label: "ด่วน", variant: "warning" },
  very_urgent: { label: "ด่วนมาก", variant: "warning" },
  most_urgent: { label: "ด่วนที่สุด", variant: "danger" },
};

export const STATUS_LABELS: Record<DocumentStatus, { label: string; variant: "default" | "warning" | "success" | "info" }> = {
  received: { label: "ลงรับแล้ว", variant: "info" },
  routing: { label: "อยู่ระหว่างเกษียน", variant: "warning" },
  signed: { label: "ลงนามแล้ว", variant: "success" },
  completed: { label: "ดำเนินการเรียบร้อย", variant: "default" },
};

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  external: "หนังสือภายนอก",
  internal: "หนังสือภายใน",
  order: "คำสั่งโรงเรียน",
  announcement: "ประกาศโรงเรียน",
};
