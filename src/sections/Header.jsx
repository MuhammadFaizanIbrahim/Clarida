import React, { useState } from "react";
import { FiVolume2, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Button from "../components/Button";
import DropdownMenu from "../components/DropdownMenuBox";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  return (
    <header
      className="fixed left-1/2 -translate-x-1/2 z-50 w-full lg:w-[85.208vw] max-w-[1200px] h-[55px] md:h-[70px] lg:h-[3.125vw] bg-white/10 backdrop-blur-md text-(--color-text) 
    flex items-center justify-between lg:px-5 lg:py-3 px-8 py-2 rounded-b-2xl"
    >
      {/* Logo + Text */}
      <div className="flex items-center gap-2">
        <img
          src="/logoIcon.png"
          alt="Clarida Logo"
          className="lg:w-[1.884vw] lg:h-[2.093vw]"
        />
        <img
          src="/logoText.svg"
          alt="Clarida Text"
          className="w-[100px] h-[16] lg:w-[5.302vw] lg:h-[0.872vw] hidden md:flex"
        />
      </div>

      {/* Desktop Nav */}
     {/* Desktop / Tablet Nav */}
<nav className="hidden md:flex items-center gap-8 relative">
  {/* Science Menu */}
  <div
    className="relative group"
    onClick={() =>
      setOpenSubmenu(openSubmenu === "science" ? null : "science")
    }
  >
    <a href="#" className="menu-text flex gap-2 items-center select-none">
      Science
      <img
        src="/arrowIcon.svg"
        alt="Clarida Text"
        className={`lg:mt-1.5 transition-transform duration-200 ${
          openSubmenu === "science" ? "rotate-180" : "group-hover:rotate-180"
        }`}
      />
    </a>
    <DropdownMenu
      items={[
        { label: "Regeneration Biology", href: "#" },
        { label: "The Clarida Method", href: "#" },
        { label: "Timing Algorithm", href: "#" },
      ]}
      isOpen={openSubmenu === "science"}
      onClose={() => setOpenSubmenu(null)}
    />
  </div>

  {/* Proof Menu */}
  <div
    className="relative group"
    onClick={() => setOpenSubmenu(openSubmenu === "proof" ? null : "proof")}
  >
    <a href="#" className="menu-text flex gap-2 items-center select-none">
      Proof
      <img
        src="/arrowIcon.svg"
        alt="Clarida Text"
        className={`lg:mt-1.5 transition-transform duration-200 ${
          openSubmenu === "proof" ? "rotate-180" : "group-hover:rotate-180"
        }`}
      />
    </a>
    <DropdownMenu
      items={[
        { label: "Patient Stories", href: "#" },
        { label: "Clinical Insights", href: "#" },
        { label: "Research Archive", href: "#" },
      ]}
      isOpen={openSubmenu === "proof"}
      onClose={() => setOpenSubmenu(null)}
    />
  </div>

  {/* Regular menu items */}
  <a href="#" className="menu-text">Vision Guide</a>
  <a href="#" className="menu-text">About</a>
  <a href="#" className="menu-text">Store</a>
</nav>


      {/* Right Side */}
      <div className="flex items-center gap-5 md:gap-4">
        <Button
          width="w-[170px] lg:w-[10.313vw]"
          height="h-[40px] lg:h-[2.083vw]"
          extra="gap-2 lg:gap-4 lg:py-[12px] lg:px-[12px] hidden md:flex"
        >
          Begin your journey
          <img src="/arrowIcon.svg" alt="Clarida Text" className="rotate-270" />
        </Button>

        <img
          src="/audioOnIcon.svg"
          alt="Audio On/Off"
          className="border rounded-full w-8 h-8 md:w-9 md:h-9 lg:w-[2.083vw] lg:h-[2.083vw] p-[5px] hover:bg-[rgba(255,255,255,0.25)] cursor-pointer"
        />

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="menu-items-dropdown-text flex items-center gap-3 md:hidden transition duration-300 w-20 justify-center"
        >
          <span className="inline-block w-10 text-center">
            {isMenuOpen ? "Close" : "Menu"}
          </span>
          {isMenuOpen ? <FiX size={27} /> : <FiMenu size={27} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="menu-text absolute top-full right-0 w-full h-full bg-transparent backdrop-blur-lg flex flex-col gap-8">
          <div className="py-4 px-7 flex flex-col gap-3">
            <a href="#" className="hover:text-cyan-400">
              Home
            </a>
            <div className="relative">
              <a
                href="#"
                className="menu-text flex justify-between items-center"
                onClick={(e) => {
                  e.preventDefault(); // prevent scrolling
                  setOpenSubmenu(openSubmenu === "science" ? null : "science");
                }}
              >
                Science & Regeneration
                <img
                  src="/arrowIcon.svg"
                  alt="Arrow"
                  className={`transition-transform duration-200 ${
                    openSubmenu === "science" ? "rotate-180" : ""
                  }`}
                />
              </a>

              {openSubmenu === "science" && (
                <DropdownMenu
                  items={[
                    { label: "Regeneration Biology", href: "#" },
                    { label: "The Clarida Method", href: "#" },
                    { label: "Timing Algorithm", href: "#" },
                  ]}
                  position="left-0"
                  mobile={true} // optional, you can style differently for mobile
                />
              )}
            </div>
            <div className="relative">
              <a
                href="#"
                className="menu-text flex justify-between items-center"
                onClick={(e) => {
                  e.preventDefault(); // prevent scrolling
                  setOpenSubmenu(openSubmenu === "proof" ? null : "proof");
                }}
              >
                Proof & Results
                <img
                  src="/arrowIcon.svg"
                  alt="Arrow"
                  className={`transition-transform duration-200 ${
                    openSubmenu === "proof" ? "rotate-180" : ""
                  }`}
                />
              </a>

              {openSubmenu === "proof" && (
                <DropdownMenu
                  items={[
                    { label: "Patient Stories", href: "#" },
                    { label: "Clinical Insights", href: "#" },
                    { label: "Research Archive", href: "#" },
                  ]}
                  position="left-0"
                  mobile={true} // optional, you can style differently for mobile
                />
              )}
            </div>
            <a href="#" className="hover:text-cyan-400">
              Vision Guide AI
            </a>
            <a href="#" className="hover:text-cyan-400">
              About Clarida
            </a>
            <a href="#" className="hover:text-cyan-400">
              Early Access/Store
            </a>
          </div>
          <div className="py-4 px-8">
            <Button
              width="w-full"
              height="h-[48px]"
              extra="gap-2 py-[24px] px-[12px] flex"
            >
              Begin your journey
              <img
                src="/arrowIcon.svg"
                alt="Clarida Text"
                className="rotate-270"
              />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
