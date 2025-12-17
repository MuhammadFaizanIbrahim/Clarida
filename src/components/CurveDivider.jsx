// src/components/CurveDivider.jsx
import React from "react";

export default function CurveDivider() {
  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2 overflow-visible">
      <img
        src="/icons/claridapulse.svg"   // make sure it lives at public/icons/claridapulse.svg
        alt=""
        aria-hidden="true"
        className="block w-full h-auto max-w-none"
      />
    </div>
  );
}
