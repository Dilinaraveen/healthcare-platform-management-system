import React from "react";

const Button = ({ label, onClick }) => {
  return (
    <button
      className="bg-primary text-white font-medium px-6 py-3 rounded-full hidden md:block"
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
