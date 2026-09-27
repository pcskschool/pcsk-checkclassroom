"use client";

import React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "ยืนยันดำเนินการ",
  cancelLabel = "ยกเลิก",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const iconConfig = {
    danger: {
      icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
      bg: "bg-rose-50 border-rose-200",
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      bg: "bg-amber-50 border-amber-200",
    },
    primary: {
      icon: <Info className="w-6 h-6 text-green-700" />,
      bg: "bg-green-50 border-green-200",
    },
  };

  const currentIcon = iconConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOutsideClick={!isLoading}
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "warning" ? "primary" : variant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-2xs ${currentIcon.bg}`}
        >
          {currentIcon.icon}
        </div>
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-1">{title}</h4>
          <div className="text-base text-slate-600 leading-relaxed">
            {message}
          </div>
        </div>
      </div>
    </Modal>
  );
}
