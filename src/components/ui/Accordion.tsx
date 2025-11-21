"use client";

import { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
}

export default function Accordion({
  items,
  defaultOpen = [],
  allowMultiple = true,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div
            key={item.id}
            className="border-2 border-gray-800 bg-gray-900 overflow-hidden"
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-800/50 transition-all duration-100"
            >
              <div className="flex items-center gap-3">
                {item.icon && (
                  <span className="text-green-400 text-lg">{item.icon}</span>
                )}
                <span className="text-white font-medium">{item.title}</span>
              </div>
              <span className="text-gray-400 text-xl">
                {isOpen ? <IoChevronUp /> : <IoChevronDown />}
              </span>
            </button>

            {/* Accordion Content */}
            {isOpen && (
              <div className="border-t-2 border-gray-800 p-4 animate-fadeIn">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
