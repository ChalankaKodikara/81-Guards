import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import Sidebar_Logo from "../../assets/LOGO HRIS 6.png";
import sidebarData from "./sidebar_data";
import { RiLogoutCircleRLine } from "react-icons/ri";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [expandedMenu, setExpandedMenu] = useState({});
  const [isShaking, setIsShaking] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSubMenu = (name) => {
    setExpandedMenu((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const isSelectedPath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  const renderSubModules = (subModules, parentPath = "") => {
    return (
      <ul className={`ml-4 ${!isOpen && "hidden"}`}>
        {subModules.map((subModule) => {
          const currentPath = `${parentPath}${subModule.url}`;
          const isSelected = isSelectedPath(currentPath);
          return (
            <li
              key={subModule._id}
              className={`flex items-center p-2 ${isSelected ? "font-bold text-white" : "text-gray-200"
                }`}
            >
              {isSelected && (
                <span className="mr-2 w-2 h-2 bg-white rounded-full"></span>
              )}
              <Link to={currentPath}>{subModule.name}</Link>
            </li>
          );
        })}
      </ul>
    );
  };

  const handleLogout = () => {
    console.log("Logging out...");
    navigate("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-[#001F3F] p-5 pt-8 shadow-lg 
        transition-all duration-500 ease-in-out ${isOpen ? "w-64" : "w-20"
        } flex flex-col ${isShaking ? "animate-shakeX" : ""}`}
      onMouseEnter={() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500); // Stops the animation after 500ms
        !isOpen && toggleSidebar();
      }}
      onMouseLeave={() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500); // Stops the animation after 500ms
        isOpen && toggleSidebar();
      }}
    >
      <div className="text-center text-white mb-12">
        <img
          src={Sidebar_Logo}
          alt="Logo"
          className={`mx-auto transition-transform duration-500 ease-in-out ${isOpen ? "w-24 h-24" : "w-10 h-10"
            }`}
        />
        {isOpen && (
          <h1 className="text-2xl font-semibold transition-opacity duration-500">
           QuorTech HRIS
          </h1>
        )}
      </div>
      <div className="overflow-y-auto flex-1 custom-scrollbar">
        <ul>
          {sidebarData.map((module) => {
            const isModuleSelected = isSelectedPath(module.url);
            const hasSubModules =
              module.subModules && module.subModules.length > 0;
            return (
              <li key={module._id} className="mt-1">
                <div
                  className={`flex items-center p-2 rounded-md cursor-pointer transition-colors duration-300 ease-in-out ${isModuleSelected ? "bg-[#2495FE]" : "hover:bg-[#01E6FF]"
                    } text-white`}
                  onClick={() =>
                    hasSubModules
                      ? toggleSubMenu(module._id)
                      : navigate(module.url)
                  }
                >
                  {module.icon && (
                    <span
                      className={`transition-transform duration-300 ${isOpen ? "scale-100" : "scale-75"
                        }`}
                    >
                      {module.icon}
                    </span>
                  )}
                  {isOpen && <span className="ml-2">{module.name}</span>}
                  {isOpen && hasSubModules && (
                    <span className="ml-auto">
                      {expandedMenu[module._id] ? (
                        <FaChevronDown />
                      ) : (
                        <FaChevronRight />
                      )}
                    </span>
                  )}
                </div>
                {expandedMenu[module._id] &&
                  hasSubModules &&
                  renderSubModules(module.subModules, module.url)}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center p-3 w-full text-white bg-[#2495FE] font-bold rounded-lg transition-transform duration-300 hover:scale-105"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
