import { InputHTMLAttributes } from "react";

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function PixelInput({ 
  label, 
  error, 
  className = "",
  ...props 
}: PixelInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-pixel-primary font-pixel">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-3
          bg-pixel-darker
          border-2 
          ${error ? "border-red-500" : "border-pixel-primary"}
          text-pixel-light
          focus:border-pixel-secondary
          focus:outline-none
          transition-all
          text-sm
          ${className}
        `}
        style={{
          ...((props.style || {}) as any),
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 10px color-mix(in srgb, var(--pixel-secondary) 50%, transparent)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
