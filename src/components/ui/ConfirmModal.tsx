"use client";

import { useState, ReactNode } from "react";
import Modal from "./Modal";
import { IoWarning, IoTrash, IoInformationCircle } from "react-icons/io5";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirmation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const variantConfig = {
    danger: {
      icon: <IoTrash className="text-3xl text-red-400" />,
      iconBg: "bg-red-500/10",
      buttonClass: "bg-red-500 hover:bg-red-600 text-white",
    },
    warning: {
      icon: <IoWarning className="text-3xl text-yellow-400" />,
      iconBg: "bg-yellow-500/10",
      buttonClass: "bg-yellow-500 hover:bg-yellow-600 text-white",
    },
    info: {
      icon: <IoInformationCircle className="text-3xl text-blue-400" />,
      iconBg: "bg-blue-500/10",
      buttonClass: "bg-blue-500 hover:bg-blue-600 text-white",
    },
  };

  const config = variantConfig[variant];

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`
              px-4 py-2 text-sm font-medium transition-all duration-100
              disabled:opacity-50 disabled:cursor-not-allowed
              ${config.buttonClass}
            `}
          >
            {isLoading ? "Processing..." : confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg ${config.iconBg}`}>{config.icon}</div>
        <div className="flex-1">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </Modal>
  );
}
