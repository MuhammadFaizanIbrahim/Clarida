import React from "react";
import "../index.css";

const Button = ({
  children,
  width = "", 
  height = "",
//   top = "",   
//   left = "",  
  extra = ""  
}) => {
  return (
    <button
      className={`btn ${width} ${height} ${extra}`}
    >
      {children}
    </button>
  );
};

export default Button;
