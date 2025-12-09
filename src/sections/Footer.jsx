import React from "react";
import Button from "../components/Button.jsx";
import CustomSelect from "../components/CustomSelect.jsx";
import { useMediaQuery } from "react-responsive";

const Footer = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <section className="relative h-screen bg-cover bg-center overflow-hidden">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/footer.webm"
        poster="footer-bg.png"
        autoPlay
        loop
        muted
        playsInline
      ></video>

      <div
        className="absolute inset-0 bg-black/20 z-10 flex flex-col justify-between
       py-13 px-5 md:py-8 md:px-18 lg:py-10 lg:px-40 2xl:px-[260px] gap-5 md:gap-10"
      >
        <div className="flex flex-col lg:flex-row items-center gap-0 w-full ">
          <h2 className="h2-text">
            You’re Not <span className="h2-text-bold">Waiting.</span>
          </h2>
          <h2 className="h2-text">
            You’re <span className="h2-text-bold">Awakening.</span>
          </h2>
        </div>

        {/* Contact Form */}
        <form
          className="space-y-5 md:space-y-8 lg:space-y-6 2xl:space-y-8 w-[350px] md:w-[800px] lg:w-[780px] 2xl:w-[950px] mx-auto text-center "
          onSubmit={(e) => {
            e.preventDefault(); // prevent the default form submission
            console.log("Form submitted");
            // Example: if using axios/fetch, handle the form submission logic here
          }}
        >
          {/* Name and Email Inputs */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-0.5 2xl:gap-6">
            <input
              type="text"
              placeholder="Your name*"
              className="footer-small-text py-2 w-full px-5 md:px-[26px] bg-transparent h-12 md:h-14 lg:h-[2.917vw]
               border border-[rgba(255,255,255,0.50)] rounded-lg focus:outline-none backdrop-blur-[5px]"
            />
            <input
              type="email"
              placeholder="Your email address*"
              className="footer-small-text py-2 w-full px-5 md:px-[26px] bg-transparent h-12 md:h-14 lg:h-[2.917vw]
               border border-[rgba(255,255,255,0.50)] rounded-lg focus:outline-none backdrop-blur-[5px]"
            />
          </div>

          {/* Dropdown and Text */}
          <div className="flex flex-col md:flex-row md:justify-between lg:justify-center 2xl:justify-between items-center gap-4 md:gap-4 lg:gap-0 2xl:gap-4 w-full">
            <label className="footer-small-text-bold text-left w-full md:w-[400px] lg:w-[450px] 2xl:w-[460px]">
              Why are you contacting Clarida? Please choose from the list
            </label>
            <CustomSelect />
          </div>

          {/* Inquiry Text Area */}
          <textarea
            placeholder="Your inquiry"
            rows="4"
            className="footer-small-text py-5 w-full px-5 md:px-[26px] h-[90px] md:h-[220px] lg:h-[11.458vw] bg-transparent
             border border-[rgba(255,255,255,0.50)] rounded-lg focus:outline-none backdrop-blur-[5px] resize-none"
          ></textarea>

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit" // add the submit type              
              extra="gap-3 md:gap-4 flex"
            >
              {isMobile ? "Send" : "Send Inquiry"}
              <img
                src="icons/arrowIcon.svg"
                alt="Clarida Text"
                className="rotate-270"
              />
            </Button>
          </div>
        </form>

        {/* Footer Links and Logo */}
        <div className="w-full flex flex-col md:flex-row items-center md:items-end lg:items-center 2xl:items-end justify-center md:justify-between
         h-auto md:h-40 lg:h-20 2xl:h-40 px-15 py-5 md:px-10 md:py-10 bg-transparent border border-[rgba(255,255,255,0.50)] rounded-lg backdrop-blur-[5px] gap-6 md:gap-0">
          {/* Logo (Mobile: Top, Desktop: Center) */}
          <div className="flex flex-col items-center order-1 md:order-2">
            <div className="flex items-center gap-2 md:gap-0">
              <img
                src="images/logoIconFooter.png"
                alt="Clarida Logo"
                className="w-9 h-10 md:w-[54px] md:h-[54px] lg:w-[2.813vw] lg:h-[3.125vw]"
              />
              <img
                src="images/logoText.svg"
                alt="Clarida Text"
                className="w-[100px] h-4 lg:w-[7.813vw] lg:h-[1.302vw]"
              />
            </div>
            <p className="footer-small-text md:mt-2 lg:mt-0 2xl:mt-2 hidden md:block">Clarida &copy; 2025</p>
          </div>

          {/* Privacy + Terms (Mobile: below logo, Desktop: left) */}
          <div className="footer-small-text flex gap-10 md:gap-4 order-2 md:order-1 -mt-2 md:mt-0 md:w-[300px]">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>

          {/* Social Icons (Mobile: below links, centered — Desktop: right) */}
          <div className="flex gap-6 justify-center order-3 md:w-[300px] md:justify-end">
            <a href="https://facebook.com">
              <img src="icons/facebook.svg" alt="Facebook" />
            </a>
            <a href="https://linkedin.com">
              <img src="icons/linkedin.svg" alt="LinkedIn" />
            </a>
            <a href="https://twitter.com">
              <img src="icons/twitter.svg" alt="Twitter" />
            </a>
            <a href="https://youtube.com">
              <img src="icons/instagram.svg" alt="Instagram" />
            </a>
            <a href="https://youtube.com">
              <img src="icons/youtube.svg" alt="Youtube" />
            </a>
          </div>
          <p className="footer-small-text -mt-2 order-4 block md:hidden">Clarida &copy; 2025</p>
        </div>
      </div>
    </section>
  );
};

export default Footer;
