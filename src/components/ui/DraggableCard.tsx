"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IoMenu, IoCreate, IoTrash } from "react-icons/io5";

interface DraggableCardProps {
  id: string;
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  isDragging?: boolean;
}

export default function DraggableCard({
  id,
  children,
  onEdit,
  onDelete,
}: DraggableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-gray-900 border-2 border-gray-800
        hover:border-gray-700 transition-all duration-100
        ${isDragging ? "scale-95" : ""}
      `}
    >
      <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors duration-100 flex-shrink-0"
          aria-label="Drag to reorder"
        >
          <IoMenu className="text-lg sm:text-xl" />
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden">{children}</div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 sm:p-2 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-100"
              aria-label="Edit"
            >
              <IoCreate className="text-base sm:text-lg" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 sm:p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-100"
              aria-label="Delete"
            >
              <IoTrash className="text-base sm:text-lg" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
