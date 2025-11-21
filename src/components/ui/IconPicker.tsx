"use client";

import { useState, useMemo } from "react";
import Modal from "./Modal";
import {
  IoGameController,
  IoRocket,
  IoShield,
  IoTrophy,
  IoStar,
  IoFlash,
  IoDiamond,
  IoSparkles,
  IoHeart,
  IoCheckmark,
  IoCode,
  IoColorPalette,
  IoConstruct,
  IoCube,
  IoExtensionPuzzle,
  IoFingerPrint,
  IoFitness,
  IoFootball,
  IoGift,
  IoGlobe,
  IoHammer,
  IoHardwareChip,
  IoHeadset,
  IoHome,
  IoInfinite,
  IoKey,
  IoLayers,
  IoLeaf,
  IoMagnet,
  IoMedal,
  IoMoon,
  IoMusicalNotes,
  IoPaw,
  IoPeople,
  IoPlanet,
  IoPlay,
  IoPower,
  IoPulse,
  IoRadio,
  IoReload,
  IoRibbon,
  IoRocket as IoRocketAlt,
  IoSearch,
  IoSettings,
  IoShapes,
  IoSpeedometer,
  IoStopwatch,
  IoSunny,
  IoSync,
  IoTelescope,
  IoThunderstorm,
  IoTime,
  IoToggle,
  IoTrendingUp,
  IoWallet,
  IoWatch,
  IoWifi,
} from "react-icons/io5";

interface IconPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

// Icon registry dengan nama dan component
const iconRegistry = [
  { name: "IoGameController", icon: IoGameController },
  { name: "IoRocket", icon: IoRocket },
  { name: "IoShield", icon: IoShield },
  { name: "IoTrophy", icon: IoTrophy },
  { name: "IoStar", icon: IoStar },
  { name: "IoFlash", icon: IoFlash },
  { name: "IoDiamond", icon: IoDiamond },
  { name: "IoSparkles", icon: IoSparkles },
  { name: "IoHeart", icon: IoHeart },
  { name: "IoCheckmark", icon: IoCheckmark },
  { name: "IoCode", icon: IoCode },
  { name: "IoColorPalette", icon: IoColorPalette },
  { name: "IoConstruct", icon: IoConstruct },
  { name: "IoCube", icon: IoCube },
  { name: "IoExtensionPuzzle", icon: IoExtensionPuzzle },
  { name: "IoFingerPrint", icon: IoFingerPrint },
  { name: "IoFitness", icon: IoFitness },
  { name: "IoFootball", icon: IoFootball },
  { name: "IoGift", icon: IoGift },
  { name: "IoGlobe", icon: IoGlobe },
  { name: "IoHammer", icon: IoHammer },
  { name: "IoHardwareChip", icon: IoHardwareChip },
  { name: "IoHeadset", icon: IoHeadset },
  { name: "IoHome", icon: IoHome },
  { name: "IoInfinite", icon: IoInfinite },
  { name: "IoKey", icon: IoKey },
  { name: "IoLayers", icon: IoLayers },
  { name: "IoLeaf", icon: IoLeaf },
  { name: "IoMagnet", icon: IoMagnet },
  { name: "IoMedal", icon: IoMedal },
  { name: "IoMoon", icon: IoMoon },
  { name: "IoMusicalNotes", icon: IoMusicalNotes },
  { name: "IoPaw", icon: IoPaw },
  { name: "IoPeople", icon: IoPeople },
  { name: "IoPlanet", icon: IoPlanet },
  { name: "IoPlay", icon: IoPlay },
  { name: "IoPower", icon: IoPower },
  { name: "IoPulse", icon: IoPulse },
  { name: "IoRadio", icon: IoRadio },
  { name: "IoReload", icon: IoReload },
  { name: "IoRibbon", icon: IoRibbon },
  { name: "IoSearch", icon: IoSearch },
  { name: "IoSettings", icon: IoSettings },
  { name: "IoShapes", icon: IoShapes },
  { name: "IoSpeedometer", icon: IoSpeedometer },
  { name: "IoStopwatch", icon: IoStopwatch },
  { name: "IoSunny", icon: IoSunny },
  { name: "IoSync", icon: IoSync },
  { name: "IoTelescope", icon: IoTelescope },
  { name: "IoThunderstorm", icon: IoThunderstorm },
  { name: "IoTime", icon: IoTime },
  { name: "IoToggle", icon: IoToggle },
  { name: "IoTrendingUp", icon: IoTrendingUp },
  { name: "IoWallet", icon: IoWallet },
  { name: "IoWatch", icon: IoWatch },
  { name: "IoWifi", icon: IoWifi },
];

export default function IconPicker({
  isOpen,
  onClose,
  onSelect,
  selectedIcon,
}: IconPickerProps) {
  const [search, setSearch] = useState("");

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    if (!search) return iconRegistry;
    const searchLower = search.toLowerCase();
    return iconRegistry.filter((item) =>
      item.name.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const handleSelect = (iconName: string) => {
    onSelect(iconName);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Icon"
      size="lg"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-100"
        >
          Cancel
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search */}
        <input
          type="text"
          placeholder="Search icons... (e.g. rocket, star, game)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border-2 border-gray-700 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors duration-100"
          autoFocus
        />

        {/* Icon Grid */}
        <div className="grid grid-cols-6 gap-2 max-h-96 overflow-y-auto">
          {filteredIcons.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedIcon === item.name;
            return (
              <button
                key={item.name}
                onClick={() => handleSelect(item.name)}
                className={`
                  p-4 border-2 transition-all duration-100
                  hover:scale-110
                  ${
                    isSelected
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-gray-800 bg-gray-900 text-gray-400 hover:border-gray-700 hover:text-white"
                  }
                `}
                title={item.name}
              >
                <Icon className="text-2xl mx-auto" />
              </button>
            );
          })}
        </div>

        {/* No results */}
        {filteredIcons.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No icons found for "{search}"
          </div>
        )}

        {/* Results count */}
        <div className="text-xs text-gray-500 text-center">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? "s" : ""}{" "}
          {search && "found"}
        </div>
      </div>
    </Modal>
  );
}
