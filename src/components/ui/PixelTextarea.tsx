import { TextareaHTMLAttributes } from "react";

interface PixelTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function PixelTextarea({ 
  label, 
  error, 
  className = "",
  ...props 
}: PixelTextareaProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-pixel-primary font-pixel">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-3
          bg-pixel-darker
          border-2 
          ${error ? "border-red-500" : "border-pixel-primary"}
          text-pixel-light
          focus:border-pixel-secondary
          focus:outline-none
          focus:shadow-[0_0_10px_rgba(96,165,250,0.5)]
          transition-all
          text-sm
          resize-vertical
          min-h-[100px]
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
