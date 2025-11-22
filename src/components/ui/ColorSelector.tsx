interface ColorSelectorProps {
  value: "primary" | "secondary" | "accent";
  onChange: (color: "primary" | "secondary" | "accent") => void;
}

export default function ColorSelector({ value, onChange }: ColorSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">Color Theme</label>
      <div className="grid grid-cols-3 gap-2">
        {(["primary", "secondary", "accent"] as const).map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`
              p-3 border-2 transition-all duration-100 text-sm font-medium capitalize
              ${value === color
                ? color === 'primary' ? 'border-green-500 bg-green-500/10 text-green-400' :
                  color === 'secondary' ? 'border-blue-500 bg-blue-500/10 text-blue-400' :
                  'border-orange-500 bg-orange-500/10 text-orange-400'
                : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
              }
            `}
          >
            {color}
          </button>
        ))}
      </div>
    </div>
  );
}
