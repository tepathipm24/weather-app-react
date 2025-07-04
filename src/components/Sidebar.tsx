import { ChevronFirst, MoreVertical } from "lucide-react";
import avatar from "../assets/avatar.jpg";
import logo from "../assets/logo-x-black.png";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface SidebarContextType {
  expanded: boolean;
}
const SidebarContext = createContext<SidebarContextType>({ expanded: true });

interface SidebarProps {
  children: ReactNode;
}
export default function Sidebar({ children }: SidebarProps) {
  const [expanded, setExpanded] = useState(() => {
    const storedExpanded = localStorage.getItem('sidebarExpanded');
    return storedExpanded ? JSON.parse(storedExpanded) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
  }, [expanded]);

  return (
    <aside className={`h-screen bg-white border-r shadow-sm transition-all duration-300 ${expanded ? "w-64" : "w-20"}`}>
      <nav className="h-full flex flex-col w-full">
        {/* Header Section: Logo and AtmosphereX Text */}
        <div className={`p-4 pb-2 flex items-center ${expanded ? "justify-start" : "justify-center"}`}>
          {/* Logo container with hover effect */}
          <div className="relative group p-1 rounded-md transition-all duration-300 group-hover:bg-gray-100">
            <img
              src={logo}
              alt="Weather App Logo"
              className="w-14 h-14 transition-all duration-300 group-hover:drop-shadow-lg group-hover:scale-105 rounded-md object-cover"
            />
          </div>

          {/* AtmosphereX text with hover effect */}
            <span
              className={`
              text-2xl font-bold text-gray-800 relative group
              overflow-hidden transition-all duration-300
              ${expanded ? "w-auto opacity-100 block" : "w-0 opacity-0 hidden"} 
                `}
            >
              AtmosphereX
              {/* เอฟเฟกต์ Hover */}
              <span
                className="
                    absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text
                    opacity-0 scale-90 transition-all duration-300 ease-out
                    group-hover:opacity-100 group-hover:scale-100
                    transform origin-left
                  "
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                AtmosphereX
              </span>
            </span>
        </div>

        {/* Sidebar Items Section */}
        {/* Provider สำหรับส่งค่า expanded ไปยัง SidebarItem */}
        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 pt-3">{children}</ul>
          {/* ปุ่มสำหรับสลับสถานะ Sidebar ที่ย้ายมาอยู่ก่อนโปรไฟล์ */}
          <div className="flex justify-center mb-3">
            <button
              onClick={() => setExpanded((curr:boolean) => !curr)}
              className={`
                  p-1.5 rounded-lg
                  transition-all duration-300 ease-in-out
                ${expanded
                  ? "bg-gradient-to-r from-indigo-200 to-indigo-100 text-indigo-800 shadow-md transform scale-105"
                  : "bg-gray-50 hover:bg-gray-100 hover:shadow-md hover:scale-105"
                  }
                `}
            >
              <ChevronFirst className={`transition-transform duration-300 ${expanded ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </SidebarContext.Provider>

        {/* Footer Section: User Profile and Toggle Button */}
        <div className="border-t flex flex-col p-3">

          {/* User Profile */}
          <div className={`flex items-center ${!expanded ? 'justify-center' : ''}`}>
            <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-md object-cover" />
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all duration-300
                ${expanded ? "w-52 ml-3" : "w-0 ml-0"}
              `}
            >
              <div className="leading-4">
                <h4 className="font-semibold text-gray-800">Tepathipm</h4>
                <span className="text-xs text-gray-600">
                  tepathip.pass@gmail.com
                </span>
              </div>
              <MoreVertical size={20} className="text-gray-500" />
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}

interface SidebarItemProps {
  icon: ReactNode;
  text: string;
  active?: boolean;
  alert?: boolean;
  onClick?: () => void;
}
export function SidebarItem({ icon, text, active = false, alert = false, onClick }: SidebarItemProps) {
  const {expanded} = useContext(SidebarContext) // ดึงค่า expanded จาก Context

  return (
    <li
      onClick={onClick}
      className={`
            relative flex items-center py-2 px-3 my-1
            font-medium rounded-md cursor-pointer
            transition-colors group 
            ${
              active
                ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800"
                : "hover:bg-indigo-50 text-gray-600"
            }
            ${!expanded ? 'justify-center' : ''}
        `}
    >
      {icon}
      <span
        className={`
            overflow-hidden transition-all duration-300
            ${expanded ? "w-52 ml-3" : "w-0 ml-0"}
            whitespace-nowrap
          `}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`
              absolute right-2 w-2 h-2 rounded-full bg-indigo-400
              ${expanded ? "" : "top-2 right-2"}
            `}
        />
      )}
      {!expanded && (
        <div
          className="
                    absolute left-full rounded-md px-2 py-1 ml-6
                    bg-indigo-100 text-indigo-800 text-sm
                    invisible opacity-0 -translate-x-3 transition-all
                    group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                    z-20
                    whitespace-nowrap
                "
        >
          {text}
        </div>
      )}
    </li>
  );
}
