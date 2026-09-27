"use client";

import React, { useState } from "react";
import type { OfficialDocument, DocumentCategory, DocumentUrgency } from "../types/document";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

export interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newDoc: OfficialDocument) => void;
}

export function NewDocumentModal({ isOpen, onClose, onSave }: NewDocumentModalProps) {
  const [docNumber, setDocNumber] = useState("");
  const [title, setTitle] = useState("");
  const [sender, setSender] = useState("");
  const [recipient, setRecipient] = useState("ผู้อำนวยการโรงเรียนพิจิตรคริสเตียน");
  const [category, setCategory] = useState<DocumentCategory>("external");
  const [urgency, setUrgency] = useState<DocumentUrgency>("normal");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docNumber.trim() || !title.trim() || !sender.trim()) {
      setError("กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน");
      return;
    }

    const newDoc: OfficialDocument = {
      id: `doc-${Date.now()}`,
      document_number: docNumber.trim(),
      title: title.trim(),
      sender: sender.trim(),
      recipient: recipient.trim(),
      date_received: new Date().toISOString().split("T")[0],
      category,
      urgency,
      status: "received",
      notes: notes.trim() || undefined,
      created_at: new Date().toISOString(),
    };

    onSave(newDoc);
    // Reset form
    setDocNumber("");
    setTitle("");
    setSender("");
    setNotes("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ลงรับหนังสือราชการใหม่"
      description="บันทึกข้อมูลหนังสือรับเข้าสู่ระบบสารบรรณอิเล็กทรอนิกส์ของสถานศึกษา"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            บันทึกลงรับหนังสือ
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="เลขที่หนังสือ"
            required
            placeholder="เช่น ศธ ๐๔๐๖๔/ว ๑๒๘"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
          />

          <Select
            label="ประเภทหนังสือ"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as DocumentCategory)}
            options={[
              { value: "external", label: "หนังสือภายนอก" },
              { value: "internal", label: "หนังสือภายใน" },
              { value: "order", label: "คำสั่งโรงเรียน" },
              { value: "announcement", label: "ประกาศโรงเรียน" },
            ]}
          />
        </div>

        <Input
          label="เรื่อง / หัวข้อหนังสือ"
          required
          placeholder="เช่น ขอเชิญประชุมสัมมนาเชิงปฏิบัติการ..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="จากหน่วยงาน / ผู้ส่ง"
            required
            placeholder="เช่น สำนักงานเขตพื้นที่การศึกษาประถมศึกษาพิจิตร เขต ๑"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          />

          <Input
            label="ถึง (ผู้รับ / เรียน)"
            required
            placeholder="เช่น ผู้อำนวยการโรงเรียนพิจิตรคริสเตียน"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="ระดับความเร่งด่วน"
            required
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as DocumentUrgency)}
            options={[
              { value: "normal", label: "ปกติ" },
              { value: "urgent", label: "ด่วน" },
              { value: "very_urgent", label: "ด่วนมาก" },
              { value: "most_urgent", label: "ด่วนที่สุด" },
            ]}
          />
        </div>

        <Textarea
          label="คำสั่งการ / หมายเหตุเพิ่มเติม"
          rows={3}
          placeholder="บันทึกข้อความสรุปหรือคำสั่งการ..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </form>
    </Modal>
  );
}
