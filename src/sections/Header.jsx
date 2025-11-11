import React, { useState } from "react";
import { FiVolume2, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Button from "../components/Button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header
      className="fixed left-1/2 -translate-x-1/2 z-50 w-full md:w-[85.208vw] max-w-[1200px] h-[55px] md:h-[3.125vw] bg-white/10 backdrop-blur-md text-white 
    flex items-center justify-between md:px-5 md:py-3 px-8 py-2 border border-white/20 shadow-md"
    >
      {/* Logo + Text */}
      <div className="flex items-center gap-2">
        <img
          src="/logoIcon.png"
          alt="Clarida Logo"
          //   className="md:w-[1.884vw] md:h-[2.093vw]"
        />
        <img
          src="/logoText.svg"
          alt="Clarida Text"
          className="w-[5.302vw] h-[0.872vw] hidden md:flex"
        />
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-8 relative">
        {/* Science Menu */}
        <div className="relative group">
          <a
            href="#"
            className="menu-text flex gap-2 items-center cursor-pointer"
          >
            Science
            <img
              src="/arrowIcon.svg"
              alt="Clarida Text"
              className="mt-1.5 transition-transform duration-200 group-hover:rotate-180"
            />
          </a>
          {/* Dropdown */}
          <div className="absolute left-0 mt-2 w-40 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Item 1
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Item 2
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Item 3
            </a>
          </div>
        </div>

        {/* Proof Menu */}
        <div className="relative group">
          <a
            href="#"
            className="menu-text flex gap-2 items-center cursor-pointer"
          >
            Proof
            <img
              src="/arrowIcon.svg"
              alt="Clarida Text"
              className="mt-1.5 transition-transform duration-200 group-hover:rotate-180"
            />
          </a>
          <div className="absolute left-0 mt-2 w-40 bg-white text-black rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200 z-10">
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Item 1
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Item 2
            </a>
            <a href="#" className="block px-4 py-2 hover:bg-gray-100">
              Item 3
            </a>
          </div>
        </div>

        {/* Regular menu items */}
        <a href="#" className="menu-text">
          Vision Guide
        </a>
        <a href="#" className="menu-text">
          About
        </a>
        <a href="#" className="menu-text">
          Store
        </a>
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-6 md:gap-4">
        <Button
          width="w-[10.313vw]"
          height="h-[2.083vw]"
          extra="btn-text gap-4 py-[12px] px-[12px] hidden md:flex"
        >
          Begin your journey
          <img src="/arrowIcon.svg" alt="Clarida Text" className="rotate-270" />
        </Button>

        <img
          src="/audioOnIcon.svg"
          alt="Audio On/Off"
          className="border rounded-full w-8 h-8 md:w-[2.083vw] md:h-[2.083vw] p-[5px]"
        />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="menu-items-dropdown-text flex items-center gap-1 md:hidden transition"
        >
          <span>Menu</span>
          {isMenuOpen ? <FiX size={27} /> : <FiMenu size={27} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="absolute top-full mt-3 right-0 w-[200px] bg-[#0b1c27]/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-lg p-4 flex flex-col gap-3 text-sm">
          <a href="#" className="hover:text-cyan-400">
            Science
          </a>
          <a href="#" className="hover:text-cyan-400">
            Proof
          </a>
          <a href="#" className="hover:text-cyan-400">
            Vision Guide
          </a>
          <a href="#" className="hover:text-cyan-400">
            About
          </a>
          <a href="#" className="hover:text-cyan-400">
            Store
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
