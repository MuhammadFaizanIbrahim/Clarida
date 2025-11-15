import React, { useState } from "react";
import Button from "../components/Button";
import { useMediaQuery } from "react-responsive";

const testimonialsData = [
  {
    name: "Steve",
    image: "images/testimonialsBG/Steve.png",
    mob_image: "images/testimonialsBG/Steve-mob.png",
    quoteStart: "I felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "prisoner", bold: true },
    ],
    description:
      "Everything was a blur — people’s faces, the street signs, even my own reflection. And just three months after starting Clarida, I passed a vision test... and got my license back.",
    age: "68",
    ml: "[calc(5.5ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Carmen",
    image: "images/testimonialsBG/Carmen.png",
    mob_image: "images/testimonialsBG/Carmen-mob.png",
    quoteStart: "The first thing I saw",
    highlight: [
      { text: "was her", bold: false },
      { text: "smile", bold: true },
    ],
    description:
      "My granddaughter’s face came into focus. I burst into tears. Clarida didn’t just give me back my vision. It gave me back connection",
    age: "72",
    ml: "[calc(5.5ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Leon",
    image: "images/testimonialsBG/Leon.png",
    mob_image: "images/testimonialsBG/Leon-mob.png",
    quoteStart: "Quiet progress day",
    highlight: [
      { text: "after", bold: false },
      { text: "day", bold: true },
    ],
    description:
      "No surgery. No side effects. And then one morning… I could read the newspaper again. Clarida gave me a rhythm I could trust.",
    age: "74",
    ml: "[calc(8ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Theresa",
    image: "images/testimonialsBG/Theresa.png",
    mob_image: "images/testimonialsBG/Theresa-mob.png",
    quoteStart: "Autumn hit me",
    highlight: [
      { text: "like a", bold: false },
      { text: "painting", bold: true },
    ],
    description:
      "I didn’t realize how much I missed color until it came back. Clarida brought the world back—in full color.",
    age: "65",
    ml: "[calc(5ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "David",
    image: "images/testimonialsBG/David.png",
    mob_image: "images/testimonialsBG/David-mob.png",
    quoteStart: "I didn’t think it",
    highlight: [
      { text: "would", bold: false },
      { text: "work", bold: true },
    ],
    description:
      "But I followed the rhythm. Every capsule. Every day. By week nine, my night vision was back. And now I can drive at dusk again.",
    age: "70",
    ml: "[calc(6ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Mei",
    image: "images/testimonialsBG/Mei.png",
    mob_image: "images/testimonialsBG/Mei-mob.png",
    quoteStart: "I finished two books",
    highlight: [
      { text: "last", bold: false },
      { text: "week", bold: true },
    ],
    description:
      "I hadn’t read a book in three years. Now, I’m back to reading every night. Clarida gave me that back—and so much more.",
    age: "69",
    ml: "[calc(8ch)]",
    mob_ml: "[calc(0ch)]",
  },
  {
    name: "Ester",
    image: "/bg-leon.jpg",
    quoteStart: "It felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "rebirth", bold: true },
    ],
    description:
      "Colors returned, lights softened, and I could finally read without strain. Clarida changed everything.",
    age: "61",
  },
  {
    name: "Adriana",
    image: "/bg-leon.jpg",
    quoteStart: "It felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "rebirth", bold: true },
    ],
    description:
      "Colors returned, lights softened, and I could finally read without strain. Clarida changed everything.",
    age: "61",
  },
  {
    name: "Mariana",
    image: "/bg-leon.jpg",
    quoteStart: "It felt like",
    highlight: [
      { text: "a", bold: false },
      { text: "rebirth", bold: true },
    ],
    description:
      "Colors returned, lights softened, and I could finally read without strain. Clarida changed everything.",
    age: "61",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false); // <-- add this
  const t = testimonialsData[active];
  const isMobile = useMediaQuery({ maxWidth: 767 }); // same as Tailwind's 'md' breakpoint

  return (
    <section
      className="relative w-full min-h-screen bg-no-repeat sm:bg-auto md:bg-cover lg:bg-auto flex flex-col-reverse md:flex-row 
      items-center justify-between px-8 py-15 md:px-20 md:py-20 lg:px-[7.813vw] lg:py-[6.5vw]"
      style={{
        backgroundImage: `url(${isMobile ? t.mob_image : t.image})`,
      }}
    >    

      {/* LEFT PANEL */}
      <div className="w-[350px] md:w-[300px] lg:w-[22.469vw] bg-white/5 backdrop-blur-[5px]
       border border-white/50 rounded-lg px-[45px] py-5 md:p-[1.563vw]">
        <h3 className="section-3-small-heading text-center md:text-left">
          <span className="md:inline-block">See What </span>
          <span className="md:inline-block md:ml-[calc(5.5ch)]">They See</span>
        </h3>

        {/* Mobile Dropdown */}
        <div className="mt-6 relative md:hidden">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full h-[50px] flex justify-between items-center px-5 rounded-lg border border-white/50 bg-white/20 backdrop-blur-[5px] cursor-pointer text-left section-3-names-text-selected"
            >
            {testimonialsData[active].name}
            <img
              src="icons/arrowIcon.svg"
              alt="Arrow"
              className={`transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-full rounded-lg border border-white/50 bg-(--color-bg) backdrop-blur-[5px] mt-2 flex flex-col z-20">
              {testimonialsData.map((item, index) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setActive(index);
                    setDropdownOpen(false);
                  }}
                  className={`block text-left px-4 cursor-pointer transition ${
                    active === index
                      ? "section-3-names-text-selected"
                      : "section-3-names-text-unselected"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Names List */}
        <div className="hidden md:block mt-6 -space-y-2 lg:space-y-0.5">
          {testimonialsData.map((item, index) => (
            <button
              key={item.name}
              onClick={() => setActive(index)}
              className={`block text-left text-base transition cursor-pointer ${
                active === index
                  ? "section-3-names-text-selected"
                  : "section-3-names-text-unselected"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <Button
          width="w-[263px] md:w-[250px] lg:w-[15.365vw]"
          height="h-[48px] md:h-[45px] lg:h-[2.917vw]"
          extra="gap-2 mt-5 lg:mt-9 lg:gap-4 lg:py-[12px] lg:px-[12px] flex"
        >
          Join The Vision Revolution
          <img
            src="icons/arrowIcon.svg"
            alt="Clarida Text"
            className="rotate-270"
          />
        </Button>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[350px] md:w-[430px] lg:w-[33.125vw] space-y-6 mt-10 md:mt-20 lg:mt-45">
        <h2>
          <span className="-mt-20 md:-mt-[8.292vw] lg:-mt-[7.292vw] absolute quotationText">
            “
          </span>
          <span className="block section-3-heading-text">{t.quoteStart}</span>
          {t.highlight.map((word, i) => (
            <span
            key={i}
            className={`${
              word.bold
                ? "section-3-heading-text-bold"
                : "section-3-heading-text"
            } ${i === 0 ? `ml-${isMobile ? t.mob_ml : t.ml}` : ""}`}
          >
            {word.text}{" "}
          </span>
          
          ))}
        </h2>

        <p className="sections-paragraph-text">{t.description}</p>

        <p className="NamesText">
          {t.name}, {t.age}
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
