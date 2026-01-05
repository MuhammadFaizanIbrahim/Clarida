import React from "react";
import "../index.css";

const Button = ({ children, extra = "", variant = "btn", ...props }) => {
  return (
    <button className={`${variant} ${extra}`} {...props}>
      {children}
    </button>
  );
};


export default Button;
