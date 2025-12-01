import React, { useState } from "react";
import { FiVolume2, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Button from "../components/Button";
import DropdownMenu from "../components/DropdownMenuBox";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  return (
    <>
      <header
        className="sticky left-1/2 -translate-x-1/2 z-50 w-full lg:w-[85.208vw] h-[55px] md:h-[70px] lg:h-[60px] 
      bg-white/10 backdrop-blur-md text-(--color-text) 
    flex items-center justify-between lg:px-5 lg:py-3 px-8 py-2 rounded-b-2xl"
      >
        {/* Logo + Text */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img
            src="images/logoIcon.png"
            alt="Clarida Logo"
            className="lg:w-[36.173px] lg:h-[40.186px]"
          />
          <img
            src="images/logoText.svg"
            alt="Clarida Text"
            className="w-[100px] h-[16] lg:w-[101.798px] lg:h-[16.742px] hidden md:flex"
          />
        </Link>

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
            <a
              href="#"
              className="menu-text flex gap-2 items-center select-none"
            >
              Science
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className={`lg:mt-1.5 transition-transform duration-200 ${
                  openSubmenu === "science"
                    ? "rotate-180"
                    : "group-hover:rotate-180"
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
            onClick={() =>
              setOpenSubmenu(openSubmenu === "proof" ? null : "proof")
            }
          >
            <a
              href="#"
              className="menu-text flex gap-2 items-center select-none"
            >
              Proof
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className={`lg:mt-1.5 transition-transform duration-200 ${
                  openSubmenu === "proof"
                    ? "rotate-180"
                    : "group-hover:rotate-180"
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
          <a href="#" className="menu-text">
            Vision Guide
          </a>
          <a href="#" className="menu-text">
            About
          </a>
          <a href="/store" className="menu-text">
            Store
          </a>
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-5 md:gap-4">
          <Button
            width="w-[170px] lg:w-[198.01px]"
            height="h-[40px] lg:h-[39.994px]"
            extra="gap-2 lg:gap-4 lg:py-[12px] lg:px-[12px] hidden md:flex"
            variant="btn-header"
          >
            Begin your journey
            <img
              src="icons/arrowIcon.svg"
              alt="Clarida Text"
              className="rotate-270"
            />
          </Button>

          <img
            src="icons/audioOnIcon.svg"
            alt="Audio On/Off"
            className="border rounded-full w-8 h-8 md:w-9 md:h-9 lg:w-[39.994px] lg:h-[39.994px] p-[5px] hover:bg-[rgba(255,255,255,0.25)] cursor-pointer"
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
      </header>
      {isMenuOpen && (
        <div className="menu-text fixed top-0 left-0 w-full h-screen bg-(--color-bg) backdrop-blur-md flex flex-col gap-8 z-40">
          <div className="py-22 px-7 flex flex-col gap-3">
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
                  src="icons/arrowIcon.svg"
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
                  src="icons/arrowIcon.svg"
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
            <a href="#">Vision Guide AI</a>
            <a href="#">About Clarida</a>
            <a href="/store">Early Access/Store</a>
          </div>
          <div className="py-4 px-8">
            <Button
              width="w-full"
              height="h-[48px]"
              extra="gap-2 py-[24px] px-[12px] flex"
            >
              Begin your journey
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className="rotate-270"
              />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
