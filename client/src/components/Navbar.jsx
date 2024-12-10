import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import Button from "./Button";
import { AppContext } from "../context/AppContext";

const navItems = [
  { name: "HOME", path: "/" },
  { name: "ALL DOCTORS", path: "/doctors" },
  { name: "ABOUT", path: "/about" },
  { name: "CONTACT", path: "/contact" },
];

const Navbar = () => {
  const navigate = useNavigate();

  const {token,setToken} = useContext(AppContext)

  const [showMenu, setShowMenu] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(false);

  const logout = () => {
    setToken('');
    localStorage.removeItem('token')
  }
  

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="logo"
      />
      <ul className="hidden md:flex items-start gap-5 font-medium">
        {navItems.map((item, index) => (
          <NavLink key={index} to={item.path}>
            <li className="py-1">{item.name}</li>
            <hr className="border-none outline-none h-0.5 bg-primary w-3/5 m-auto hidden" />
          </NavLink>
        ))}
      </ul>
      <div className="flex items-center gap-4">
        {token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-10 h-10 rounded-full cursor-pointer"
              src={assets.profile_pic}
              alt="profile"
            />
            <img onClick={()=>setShowCardMenu(prev => !prev)} className="w-2.5" src={assets.dropdown_icon} alt="dropdown" />

            {showCardMenu && (
              <div className="absolute top-0 right-0 pt-16 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
                <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => {navigate("my-profile"); setShowCardMenu(false)}}
                    className="hover:text-black cursor-pointer"
                  >
                    My Profile
                  </p>
                  <p
                    onClick={() => {navigate("my-appointments"); setShowCardMenu(false)}}
                    className="hover:text-black cursor-pointer"
                  >
                    My Appointments
                  </p>
                  <p
                    onClick={() => { logout(); setShowCardMenu(false)}}
                    className="hover:text-red-700 cursor-pointer text-red-500"
                  >
                    Logout
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button label="Create Account" onClick={() => navigate("/login")} />
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />
        {/*---Mobile Menu---*/}
        <div
          className={` ${
            showMenu ? "fixed w-full" : "h-0 w-0"
          }  md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all duration-300`}
        >
          <div className="flex justify-between items-center px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img
              className="w-7"
              src={assets.cross_icon}
              alt=""
              onClick={() => setShowMenu(false)}
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded-md inline-block ">HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded-md inline-block ">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded-md inline-block ">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded-md inline-block ">CONTACT</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
