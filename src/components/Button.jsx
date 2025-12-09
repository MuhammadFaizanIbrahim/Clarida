import React from "react";
import "../index.css";

const Button = ({
  children,
  extra = "",
  variant = "btn", // "btn" or "btn-header"
}) => {
  return (
    <button className={`${variant} ${extra}`}>
      {children}
    </button>
  );
};

export default Button;
