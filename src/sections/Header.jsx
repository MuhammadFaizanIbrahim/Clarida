import React, { useState, useEffect } from "react";
import { FiVolume2, FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Button from "../components/Button";
import DropdownMenu from "../components/DropdownMenuBox";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  // hide/show on scroll
  const [isHidden, setIsHidden] = useState(false);

  // global audio toggle state
  const [isAudioOn, setIsAudioOn] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 960);

  const location = useLocation(); // track current route

  // 🔹 ALWAYS scroll to top on route change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollNow = () => {
      // if using Lenis globally
      if (window.lenis && typeof window.lenis.scrollTo === "function") {
        window.lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
    };

    // run once immediately
    scrollNow();
    // run again shortly after layout / GSAP / Lenis settle
    const id = setTimeout(scrollNow, 50);

    return () => clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.__claridaAudioOn === "boolean"
    ) {
      setIsAudioOn(window.__claridaAudioOn);
    }
  }, []);

  // resize listener for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 960);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY;

      // scroll down
      if (diff > 1 && currentY > 0 && !isMenuOpen) {
        setIsHidden(true);
      }
      // scroll up
      else if (diff < -1) {
        setIsHidden(false);
      }

      lastScrollY = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMenuOpen]);

  // audio button handler
  const handleAudioToggle = () => {
    setIsAudioOn((prev) => {
      const next = !prev;

      if (typeof window !== "undefined") {
        window.__claridaAudioOn = next;

        window.dispatchEvent(
          new CustomEvent("clarida-audio-toggle", {
            detail: { isOn: next },
          })
        );
      }

      return next;
    });
  };

  // 🔹 Delay closing the mobile menu so scroll-to-top can happen first
  const closeMenuWithDelay = (delay = 200) => {
    setTimeout(() => {
      setIsMenuOpen(false);
    }, delay);
  };

  return (
    <>
      <header
        className={`fixed left-1/2 -translate-x-1/2 z-50 w-full xl:w-[85.208vw] h-[55px] md:h-[70px] lg:h-[60px] 
      bg-white/10 backdrop-blur-md text-(--color-text) 
    flex items-center justify-between lg:px-5 lg:py-3 px-8 py-2 rounded-b-2xl
    transition-transform duration-300 ${
      isHidden ? "-translate-y-full" : "translate-y-0"
    }`}
      >
        {/* Logo + Text */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <img
            src="images/logoIcon.png"
            alt=""
            className="lg:w-[36.173px] lg:h-[40.186px]"
          />
          <img
            src="images/logoText.svg"
            alt=""
            className={
              isMobile
                ? "hidden"
                : "w-[100px] h-4 lg:w-[101.798px] lg:h-[16.742px] flex"
            }
          />
        </Link>

        {/* Desktop / Tablet Nav (ONLY when NOT mobile) */}
        {!isMobile && (
          <nav className="flex items-center gap-8 relative">
            {/* Science Menu */}
            <div
              className="relative group"
              onClick={() =>
                setOpenSubmenu(openSubmenu === "science" ? null : "science")
              }
            >
              <Link
                to="#"
                className="menu-text flex gap-2 items-center select-none"
              >
                Science
                <img
                  src="icons/arrowIcon.svg"
                  alt=""
                  className={`lg:mt-1.5 transition-transform duration-200 ${
                    openSubmenu === "science"
                      ? "rotate-180"
                      : "group-hover:rotate-180"
                  }`}
                />
              </Link>
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
              <Link
                to="#"
                className="menu-text flex gap-2 items-center select-none"
              >
                Proof
                <img
                  src="icons/arrowIcon.svg"
                  alt=""
                  className={`lg:mt-1.5 transition-transform duration-200 ${
                    openSubmenu === "proof"
                      ? "rotate-180"
                      : "group-hover:rotate-180"
                  }`}
                />
              </Link>
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
            <Link to="#" className="menu-text">
              Vision Guide
            </Link>
            <Link to="#" className="menu-text">
              About
            </Link>
            <Link to="/store" className="menu-text">
              Store
            </Link>
          </nav>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-5 md:gap-4">
          {/* Desktop "Begin your journey" button (NOT mobile) */}
          {!isMobile && (
            <Button
              variant="btn-header"
              extra="
              hidden md:inline-flex
              md:px-4 md:py-2
              lg:px-6 lg:py-3
              lg:gap-4
              whitespace-nowrap
            "
            >
              Begin your journey
              <img
                src="icons/arrowIcon.svg"
                alt=""
                className="rotate-270"
              />
            </Button>
          )}

          {/* AUDIO TOGGLE BUTTON */}
          <img
            src={isAudioOn ? "icons/audioOnIcon.svg" : "icons/audioOffIcon.svg"}
            alt=""
            onClick={handleAudioToggle}
            className="border rounded-full w-8 h-8 md:w-9 md:h-9 lg:w-[39.994px] lg:h-[39.994px] p-[5px] hover:bg-[rgba(255,255,255,0.25)] cursor-pointer"
          />

          {/* Mobile Menu Button (ONLY when mobile) */}
          {isMobile && (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="menu-items-dropdown-text flex items-center gap-3 transition duration-300 w-20 justify-center"
            >
              <span className="inline-block w-10 text-center">
                {isMenuOpen ? "Close" : "Menu"}
              </span>
              {isMenuOpen ? <FiX size={27} /> : <FiMenu size={27} />}
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu Panel – always rendered on mobile, animated with opacity/translate */}
      {isMobile && (
        <div
          className={`
            menu-text fixed top-0 left-0 w-full h-screen bg-(--color-bg)
            backdrop-blur-md flex flex-col gap-8 z-40
            transition-all duration-300
            ${
              isMenuOpen
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-4 pointer-events-none"
            }
          `}
        >
          <div className="py-22 px-7 flex flex-col gap-3">
            {/* Close menu on click */}
            <Link
              to="#"
              className="hover:text-cyan-400"
              onClick={() => closeMenuWithDelay()}
            >
              Home
            </Link>

            {/* Science */}
            <div className="relative">
              <Link
                to="#"
                className="menu-text flex justify-between items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenSubmenu(openSubmenu === "science" ? null : "science");
                }}
              >
                Science & Regeneration
                <img
                  src="icons/arrowIcon.svg"
                  alt=""
                  className={`transition-transform duration-200 ${
                    openSubmenu === "science" ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {openSubmenu === "science" && (
                <DropdownMenu
                  items={[
                    { label: "Regeneration Biology", href: "#" },
                    { label: "The Clarida Method", href: "#" },
                    { label: "Timing Algorithm", href: "#" },
                  ]}
                  position="left-0"
                  mobile={true}
                />
              )}
            </div>

            {/* Proof */}
            <div className="relative">
              <Link
                to="#"
                className="menu-text flex justify-between items-center"
                onClick={(e) => {
                  e.preventDefault();
                  setOpenSubmenu(openSubmenu === "proof" ? null : "proof");
                }}
              >
                Proof & Results
                <img
                  src="icons/arrowIcon.svg"
                  alt=""
                  className={`transition-transform duration-200 ${
                    openSubmenu === "proof" ? "rotate-180" : ""
                  }`}
                />
              </Link>

              {openSubmenu === "proof" && (
                <DropdownMenu
                  items={[
                    { label: "Patient Stories", href: "#" },
                    { label: "Clinical Insights", href: "#" },
                    { label: "Research Archive", href: "#" },
                  ]}
                  position="left-0"
                  mobile={true}
                />
              )}
            </div>

            {/* These close the menu on click */}
            <Link
              to="#"
              onClick={() => closeMenuWithDelay()}
            >
              Vision Guide AI
            </Link>
            <Link
              to="#"
              onClick={() => closeMenuWithDelay()}
            >
              About Clarida
            </Link>
            <Link
              to="/store"
              onClick={() => closeMenuWithDelay()}
            >
              Early Access/Store
            </Link>
          </div>

          <div className="py-4 px-8">
            <Button
              extra="
                w-full
                gap-2
                py-3 px-3
              "
            >
              Begin your journey
              <img
                src="icons/arrowIcon.svg"
                alt=""
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
