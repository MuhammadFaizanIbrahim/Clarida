import React, { useEffect, useRef } from "react";

const DropdownMenu = ({
  items = [],
  position = "left-0",
  mobile = false,
  isOpen = false,
  onClose = () => {}, // 👈 callback to close from parent
}) => {
  const dropdownRef = useRef(null);

  // ✅ Detect clicks outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!items.length) return null;

  if (mobile) {
    // ✅ Mobile: always visible inside overlay
    return (
      <div className="relative opacity-100 -mt-1 visible bg-transparent text-(--color-text)">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href || "#"}
            className="menu-items-dropdown-text block"
          >
            {item.label}
          </a>
        ))}
      </div>
    );
  }

  // ✅ Desktop + Tablet shared base styles
  const baseClasses = `
    absolute ${position} mt-[14px] lg:mt-[9px]
    w-[215px] h-auto
    px-4 py-2 bg-white/10 backdrop-blur-md
    rounded-b-lg shadow-lg transition-all duration-300 text-[var(--color-text)]
  `;

  // ✅ Visibility control (hover or click)
  const visibility = isOpen
    ? "opacity-100 visible translate-y-0"
    : "opacity-0 invisible -translate-y-2";

  return (
    <div
      ref={dropdownRef}
      className={`
        ${baseClasses}
        ${visibility}
        group-hover:opacity-100 group-hover:visible group-hover:translate-y-0
      `}
    >
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href || "#"}
          className="menu-items-dropdown-text block"
        >
          {item.label}
        </a>
      ))}
    </div>
  );
};

export default DropdownMenu;
