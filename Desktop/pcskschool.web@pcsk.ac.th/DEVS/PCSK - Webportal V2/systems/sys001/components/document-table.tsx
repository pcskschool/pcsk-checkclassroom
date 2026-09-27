"use client";

import React from "react";
import type { OfficialDocument } from "../types/document";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatThaiDate } from "@/lib/utils";
import { URGENCY_LABELS, STATUS_LABELS, CATEGORY_LABELS } from "../constants";
import { FileText, Eye } from "lucide-react";

export interface DocumentTableProps {
  documents: OfficialDocument[];
  onViewDetail: (doc: OfficialDocument) => void;
}

/**
 * Official Documents Table Component (sys001).
 * Strictly reuses Shared Table and Badge components from Portal Core (Section 25).
 */
export function DocumentTable({ documents, onViewDetail }: DocumentTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-48">เลขที่หนังสือ</TableHead>
          <TableHead>เรื่อง / รายละเอียด</TableHead>
          <TableHead className="w-56">จากหน่วยงาน</TableHead>
          <TableHead className="w-36">วันที่ลงรับ</TableHead>
          <TableHead className="w-28 text-center">ความเร่งด่วน</TableHead>
          <TableHead className="w-36 text-center">สถานะ</TableHead>
          <TableHead className="w-24 text-right">การจัดการ</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {documents.map((doc) => {
          const urgencyInfo = URGENCY_LABELS[doc.urgency];
          const statusInfo = STATUS_LABELS[doc.status];

          return (
            <TableRow key={doc.id}>
              {/* Document Number */}
              <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-700 flex-shrink-0" />
                  <span>{doc.document_number}</span>
                </div>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {CATEGORY_LABELS[doc.category]}
                </span>
              </TableCell>

              {/* Title & Recipient */}
              <TableCell>
                <p className="font-semibold text-slate-900 leading-snug line-clamp-2">
                  {doc.title}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  ถึง: {doc.recipient}
                </p>
              </TableCell>

              {/* Sender */}
              <TableCell className="text-slate-600 text-sm">
                <span className="line-clamp-2 leading-relaxed">
                  {doc.sender}
                </span>
              </TableCell>

              {/* Received Date */}
              <TableCell className="text-slate-600 text-sm whitespace-nowrap">
                {formatThaiDate(doc.date_received)}
              </TableCell>

              {/* Urgency */}
              <TableCell className="text-center">
                <Badge variant={urgencyInfo.variant} size="sm">
                  {urgencyInfo.label}
                </Badge>
              </TableCell>

              {/* Status */}
              <TableCell className="text-center">
                <Badge variant={statusInfo.variant} size="sm" dot>
                  {statusInfo.label}
                </Badge>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetail(doc)}
                  aria-label={`ดูรายละเอียดหนังสือเลขที่ ${doc.document_number}`}
                  leftIcon={<Eye className="w-4 h-4 text-slate-500" />}
                >
                  เปิดดู
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
