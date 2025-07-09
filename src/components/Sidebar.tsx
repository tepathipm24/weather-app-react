import { ChevronFirst, MoreVertical } from "lucide-react";
import avatar from "../assets/avatar.jpg";
import logoBlack from "../assets/logo-x-black.png";
import logoWhite from "../assets/logo-x-white.png";
import { createContext, useContext, useState, useEffect } from "react";
import { useThemeContext } from "./ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import type { ReactNode } from "react";

interface SidebarContextType {
  expanded: boolean;
}
const SidebarContext = createContext<SidebarContextType>({ expanded: true });

interface SidebarProps {
  children: ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const { mode, colors } = useThemeContext();
  const { isMobile, isTablet } = useBreakpoint();
  
  const [expanded, setExpanded] = useState(() => {
    const storedExpanded = localStorage.getItem('sidebarExpanded');
    return storedExpanded ? JSON.parse(storedExpanded) : true;
  });

  useEffect(() => {
    localStorage.setItem('sidebarExpanded', JSON.stringify(expanded));
  }, [expanded]);

  // Force expanded state on mobile/tablet when in drawer
  const isExpanded = isMobile || isTablet ? true : expanded;

  // Dynamic styles based on theme
  const sidebarStyle = {
    backgroundColor: colors.surface,
    borderRightColor: mode === 'light' ? '#e5e7eb' : '#374151',
    color: colors.text,
  };

  const logoSrc = mode === 'dark' ? logoWhite : logoBlack;

  return (
    <aside
      className={`h-screen border-r shadow-sm transition-all duration-300 ${
        isMobile || isTablet
          ? "w-full"
          : isExpanded
            ? "w-64"
            : "w-20"
      }`}
      style={{
        ...sidebarStyle,
        minWidth: isMobile || isTablet ? 'auto' : isExpanded ? '256px' : '80px',
      }}
    >
      <nav className="h-full flex flex-col w-full">
        {/* Header Section: Logo and AtmosphereX Text */}
        <div className={`p-4 pb-2 flex items-center ${isExpanded ? "justify-start" : "justify-center"}`}>
          {/* Logo container with hover effect */}
          <div className="relative group p-1 rounded-md transition-all duration-300 hover:bg-opacity-10"
               style={{ 
                 backgroundColor: 'transparent',
                 '--hover-bg': mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'
               } as React.CSSProperties}>
            <img
              src={logoSrc}
              alt="Weather App Logo"
              className="w-14 h-14 transition-all duration-300 group-hover:drop-shadow-lg group-hover:scale-105 rounded-md object-cover"
            />
          </div>

          {/* AtmosphereX text with hover effect */}
            <span
              className={`
              text-2xl font-bold relative group
              overflow-hidden transition-all duration-300
              ${isExpanded ? "w-auto opacity-100 block" : "w-0 opacity-0 hidden"}
                `}
            style={{ color: colors.text }}
            >
              AtmosphereX
              {/* เอฟเฟกต์ Hover */}
              <span
                className="
                absolute inset-0 bg-gradient-to-r text-transparent bg-clip-text
                    opacity-0 scale-90 transition-all duration-300 ease-out
                    group-hover:opacity-100 group-hover:scale-100
                    transform origin-left
                  "
              style={{ 
                backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.accent})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
              >
                AtmosphereX
              </span>
            </span>
        </div>

        {/* Sidebar Items Section */}
        <SidebarContext.Provider value={{ expanded: isExpanded }}>
          <ul className="flex-1 px-3 pt-3">{children}</ul>
          
          {/* Toggle button - only show on desktop */}
          {!isMobile && !isTablet && (
            <div className="flex justify-center mb-3">
              <button
                onClick={() => setExpanded((curr: boolean) => !curr)}
                className="p-1.5 rounded-lg transition-all duration-300 ease-in-out hover:scale-105"
                style={{
                  backgroundColor: expanded
                    ? mode === 'light'
                      ? `${colors.primary}20`
                      : `${colors.primary}30`
                    : mode === 'light'
                      ? 'rgba(0, 0, 0, 0.05)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: expanded ? colors.primary : colors.text,
                  boxShadow: expanded
                    ? mode === 'light'
                      ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                      : '0 2px 4px rgba(0, 0, 0, 0.3)'
                    : 'none',
                }}
              >
                <ChevronFirst
                  className={`transition-transform duration-300 ${expanded ? '' : 'rotate-180'}`}
                  size={20}
                />
              </button>
            </div>
          )}
        </SidebarContext.Provider>

        {/* Footer Section: User Profile */}
        <div 
          className="flex flex-col p-3"
          style={{ 
            borderTopColor: mode === 'light' ? '#e5e7eb' : '#374151',
            borderTopWidth: '1px',
            borderTopStyle: 'solid'
          }}
        >
          <div className={`flex items-center ${!isExpanded ? 'justify-center' : ''}`}>
            <img
              src={avatar}
              alt="User Avatar"
              className="w-10 h-10 rounded-md object-cover ring-2 ring-opacity-20"
              style={{ '--tw-ring-color': colors.primary } as React.CSSProperties}
            />
            <div
              className={`
                flex justify-between items-center
                overflow-hidden transition-all duration-300
                ${isExpanded ? "w-52 ml-3" : "w-0 ml-0"}
              `}
            >
              <div className="leading-4">
                <h4 className="font-semibold" style={{ color: colors.text }}>
                  Tepathipm
                </h4>
                <span 
                  className="text-xs"
                  style={{ color: mode === 'light' ? '#6b7280' : '#9ca3af' }}
                >
                  tepathip.pass@gmail.com
                </span>
              </div>
              <MoreVertical 
                size={20} 
                style={{ color: mode === 'light' ? '#6b7280' : '#9ca3af' }}
              />
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
  const { expanded } = useContext(SidebarContext);
  const { mode, colors } = useThemeContext();
  const { isMobile, isTablet } = useBreakpoint();

  const itemStyle = {
    backgroundColor: active 
      ? mode === 'light' 
        ? `${colors.primary}15`
        : `${colors.primary}25`
      : 'transparent',
    color: active ? colors.primary : colors.text,
  };

  const hoverStyle = {
    backgroundColor: mode === 'light' 
      ? `${colors.primary}10` 
      : `${colors.primary}15`,
  };

  return (
    <li
      onClick={onClick}
      className={`
            relative flex items-center py-2 px-3 my-1
            font-medium rounded-md cursor-pointer
        transition-all duration-300 group
            ${!expanded ? 'justify-center' : ''}
        hover:scale-[1.02]
        ${isMobile || isTablet ? 'py-3' : 'py-2'}
        `}
      style={itemStyle}
      onMouseEnter={(e) => {
        if (!active) {
          Object.assign(e.currentTarget.style, hoverStyle);
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <div style={{ color: active ? colors.primary : colors.text }}>
      {icon}
      </div>
      <span
        className={`
            overflow-hidden transition-all duration-300
            ${expanded ? "w-52 ml-3" : "w-0 ml-0"}
            whitespace-nowrap
          `}
        style={{ color: active ? colors.primary : colors.text }}
      >
        {text}
      </span>
      {alert && (
        <div
          className={`
            absolute right-2 w-2 h-2 rounded-full
              ${expanded ? "" : "top-2 right-2"}
            animate-pulse
            `}
          style={{ backgroundColor: colors.accent }}
        />
      )}
      {!expanded && !isMobile && !isTablet && (
        <div
          className="
                    absolute left-full rounded-md px-2 py-1 ml-6
            text-sm
                    invisible opacity-0 -translate-x-3 transition-all
                    group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
                    z-20
                    whitespace-nowrap
            shadow-lg
                "
          style={{
            backgroundColor: colors.surface,
            color: colors.text,
            border: `1px solid ${mode === 'light' ? '#e5e7eb' : '#374151'}`,
          }}
        >
          {text}
        </div>
      )}
    </li>
  );
}