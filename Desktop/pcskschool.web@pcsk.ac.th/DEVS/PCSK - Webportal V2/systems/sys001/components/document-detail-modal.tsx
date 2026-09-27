"use client";

import React from "react";
import type { OfficialDocument } from "../types/document";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatThaiDate } from "@/lib/utils";
import { URGENCY_LABELS, STATUS_LABELS, CATEGORY_LABELS } from "../constants";
import { FileText, Printer, CheckCircle2 } from "lucide-react";

export interface DocumentDetailModalProps {
  document: OfficialDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus?: (docId: string, newStatus: OfficialDocument["status"]) => void;
}

export function DocumentDetailModal({
  document,
  isOpen,
  onClose,
  onUpdateStatus,
}: DocumentDetailModalProps) {
  if (!document) return null;

  const urgencyInfo = URGENCY_LABELS[document.urgency];
  const statusInfo = STATUS_LABELS[document.status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="รายละเอียดหนังสือราชการ"
      description={`เลขที่ ${document.document_number}`}
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            พิมพ์ใบปะหน้า
          </Button>
          {document.status !== "signed" && document.status !== "completed" && (
            <Button
              variant="primary"
              onClick={() => {
                onUpdateStatus?.(document.id, "signed");
                onClose();
              }}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              ลงนามเกษียนหนังสือ
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            ปิดหน้าต่าง
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Top Status & Urgency Header */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">สถานะเอกสาร:</span>
            <Badge variant={statusInfo.variant} dot>
              {statusInfo.label}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">ความเร่งด่วน:</span>
            <Badge variant={urgencyInfo.variant}>
              {urgencyInfo.label}
            </Badge>
          </div>
        </div>

        {/* Core Document Information Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ประเภทหนังสือ
            </span>
            <p className="font-semibold text-slate-900">
              {CATEGORY_LABELS[document.category]}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              วันที่ลงรับหนังสือ
            </span>
            <p className="font-semibold text-slate-900">
              {formatThaiDate(document.date_received)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              จากหน่วยงาน / ต้นสังกัด
            </span>
            <p className="text-slate-800">{document.sender}</p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ถึง (ผู้รับ / เรียน)
            </span>
            <p className="text-slate-800">{document.recipient}</p>
          </div>

          <div className="sm:col-span-2 space-y-1 border-t border-slate-100 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              เรื่อง
            </span>
            <p className="text-lg font-bold text-slate-900 leading-snug">
              {document.title}
            </p>
          </div>

          {document.notes && (
            <div className="sm:col-span-2 p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                คำสั่งการ / ข้อความเกษียน
              </span>
              <p className="text-slate-800 leading-relaxed">
                {document.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
