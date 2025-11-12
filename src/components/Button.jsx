import React from "react";
import "../index.css";

const Button = ({
  children,
  width = "", 
  height = "",
//   top = "",   
//   left = "",  
  extra = "",
  variant = "btn", // "btn" or "btn-header"
}) => {
  return (
    <button
      className={`${variant} ${width} ${height} ${extra}`}
    >
      {children}
    </button>
  );
};

export default Button;
