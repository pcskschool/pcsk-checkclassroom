"use client";

import React, { useState, useMemo } from "react";
import type { OfficialDocument, DocumentCategory } from "../types/document";
import { INITIAL_DOCUMENTS } from "../services/document-service";
import { DocumentTable } from "./document-table";
import { NewDocumentModal } from "./new-document-modal";
import { DocumentDetailModal } from "./document-detail-modal";
import { PageHeader } from "@/components/core/page-header";
import { AnnouncementBanner } from "@/components/core/announcement-banner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Info, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

export function Sys001Client() {
  const [documents, setDocuments] = useState<OfficialDocument[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isNewDocOpen, setIsNewDocOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<OfficialDocument | null>(null);
  const [isInitialAlertOpen, setIsInitialAlertOpen] = useState(false);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (categoryFilter !== "all" && doc.category !== categoryFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNumber = doc.document_number.toLowerCase().includes(query);
        const matchTitle = doc.title.toLowerCase().includes(query);
        const matchSender = doc.sender.toLowerCase().includes(query);
        if (!matchNumber && !matchTitle && !matchSender) return false;
      }

      return true;
    });
  }, [documents, searchQuery, categoryFilter]);

  // Paginated documents
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(startIndex, startIndex + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredDocuments.length / pageSize) || 1;

  // Handlers
  const handleAddNewDoc = (newDoc: OfficialDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  const handleUpdateStatus = (docId: string, newStatus: OfficialDocument["status"]) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, status: newStatus } : doc))
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header (Standardized Section 7 & 26) */}
      <PageHeader
        title="ระบบงานสารบรรณอิเล็กทรอนิกส์ (E-Document)"
        description="บริหารจัดการ ทะเบียนรับ-ส่ง และเกษียนหนังสือราชการภายในสถานศึกษา"
        breadcrumbs={[
          { label: "งานบริหาร", href: "/dashboard" },
          { label: "ระบบงานสารบรรณอิเล็กทรอนิกส์", isCurrent: true },
        ]}
        badge={<Badge variant="success" dot>งานบริหาร</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                แดชบอร์ด
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsNewDocOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              ลงรับหนังสือใหม่
            </Button>
          </div>
        }
      />

      {/* 2. System Announcement (Section 22) */}
      <AnnouncementBanner
        title="📢 ประกาศประจำระบบงานสารบรรณ"
        content="กรุณาตรวจสอบเลขที่หนังสือให้ตรงกับหมวดหมู่งานก่อนลงนามเกษียน และหนังสือที่มีระดับความเร่งด่วน 'ด่วนที่สุด' จะต้องรายงานผู้บริหารภายในวันเดียวกัน"
        type="info"
      />

      {/* 3. Search and Category Filters Panel */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="w-full sm:w-80">
          <Input
            placeholder="ค้นหาเลขที่, เรื่อง, หรือหน่วยงาน..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Category Filter Select */}
        <div className="w-full sm:w-60">
          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "ทุกประเภทหนังสือ" },
              { value: "external", label: "หนังสือภายนอก" },
              { value: "internal", label: "หนังสือภายใน" },
              { value: "order", label: "คำสั่งโรงเรียน" },
              { value: "announcement", label: "ประกาศโรงเรียน" },
            ]}
          />
        </div>
      </div>

      {/* 4. Documents Table or Empty State */}
      <div className="space-y-4">
        {filteredDocuments.length > 0 ? (
          <>
            <DocumentTable
              documents={paginatedDocuments}
              onViewDetail={(doc) => setDetailDoc(doc)}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredDocuments.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <EmptyState
            icon={<FileText className="w-7 h-7 text-slate-400" />}
            title="ไม่พบรายการหนังสือราชการ"
            description="ไม่พบหนังสือที่ตรงกับคำค้นหาหรือตัวกรองที่เลือกในขณะนี้"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setCategoryFilter("all");
                }}
              >
                ล้างการค้นหา
              </Button>
            }
          />
        )}
      </div>

      {/* 5. Modals */}
      <NewDocumentModal
        isOpen={isNewDocOpen}
        onClose={() => setIsNewDocOpen(false)}
        onSave={handleAddNewDoc}
      />

      <DocumentDetailModal
        document={detailDoc}
        isOpen={Boolean(detailDoc)}
        onClose={() => setDetailDoc(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* 6. System Alert Demonstration Modal (Section 21) */}
      <Modal
        isOpen={isInitialAlertOpen}
        onClose={() => setIsInitialAlertOpen(false)}
        title="ข้อแนะนำในการใช้งานระบบสารบรรณ"
        description="คำแนะนำสำหรับการลงรับและเกษียนหนังสือราชการ"
        size="sm"
        footer={
          <Button variant="primary" onClick={() => setIsInitialAlertOpen(false)}>
            รับทราบและเข้าสู่ระบบ
          </Button>
        }
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            ระบบงานสารบรรณเปิดให้ลงรับหนังสือราชการได้ตลอด 24 ชั่วโมง 
            เมื่อลงรับแล้วระบบจะส่งต่อให้ผู้บริหารพิจารณาเกษียนหนังสือตามลำดับขั้นตอน
          </p>
        </div>
      </Modal>
    </div>
  );
}
