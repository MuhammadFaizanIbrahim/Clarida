// CustomSelect.jsx
import React, { useState } from "react";

const CustomSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("I want more information");

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full md:max-w-[390px] lg:max-w-[460px]">
      <div
        onClick={toggleDropdown}
        className="flex justify-between items-center footer-small-text px-5 md:px-[26px] py-2 h-12 md:h-14 bg-transparent border border-[rgba(255,255,255,0.50)] rounded-lg focus:outline-none backdrop-blur-[5px] cursor-pointer"
      >
        <span className="text-left">{selectedOption}</span>
        <img
          src="icons/arrowIcon.svg"
          alt="Arrow Icon"
          className={`h-3.5 w-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>
      {isOpen && (
        <div className="absolute left-0 mt-1 w-full bg-transparent border border-[rgba(255,255,255,0.50)] rounded-lg backdrop-blur-[5px] z-10">
          <div
            onClick={() => handleSelect("I want more information")}
            className="footer-small-text text-left py-3 px-5 md:px-[26px] hover:bg-[rgba(255,255,255,0.1)] cursor-pointer"
          >
            I want more information
          </div>
          <div
            onClick={() => handleSelect("My vision is failing")}
            className="footer-small-text text-left py-3 px-5 md:px-[26px] hover:bg-[rgba(255,255,255,0.1)] cursor-pointer"
          >
            My vision is failing
          </div>
          <div
            onClick={() => handleSelect("Sign me up for a trial")}
            className="footer-small-text text-left py-3 px-5 md:px-[26px] hover:bg-[rgba(255,255,255,0.1)] cursor-pointer"
          >
            Sign me up for a trial
          </div>
          <div
            onClick={() => handleSelect("I want to reserve early access")}
            className="footer-small-text text-left py-3 px-5 md:px-[26px] hover:bg-[rgba(255,255,255,0.1)] cursor-pointer"
          >
            I want to reserve early access
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
