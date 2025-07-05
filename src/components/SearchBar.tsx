// src/components/SearchBar.tsx
import React, { useState, useMemo } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { useThemeContext } from "./ThemeContext";

// MUI Components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { getCurrentWeather } from "../services/weatherService";

// Interfaces สำหรับ Type ของข้อมูล
interface BreadcrumbItem {
  name: string;
  path: string;
  isLast?: boolean; // Optional property
}

// Custom Styled TextField for Search Bar
const SearchInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: "9999px",
    height: "40px",
    paddingLeft: "10px",
    backgroundColor: "transparent",
    border: "2px solid #d1d5db",
    boxShadow: "0 1px 4px 0 rgba(0,0,0,0.04)",
    transition: "all 0.3s ease",
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor:
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "#f9fafb",
    },
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      backgroundColor:
        theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#f3f4f6",
    },
  },
  "& .MuiInputAdornment-root": {
    marginRight: "8px",
  },
  "& input": {
    padding: "8px 12px",
    "&::placeholder": {
      color:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.5)"
          : "rgba(0,0,0,0.5)",
    },
  },
  width: "300px",
}));

interface SearchBarProps {
  city: string;
  setCity: (city: string) => void;
}

function SearchBar({ city, setCity }: SearchBarProps) {
  const location = useLocation();
  const { mode, toggleColorMode } = useThemeContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [notificationCount, setNotificationCount] = useState<number>(5);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      setCity(searchTerm.trim());
    }
  };

  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const items: BreadcrumbItem[] = [
      { name: "Overview", path: "/", isLast: pathnames.length === 0 },
    ];

    pathnames.forEach((value, index) => {
      const last = index === pathnames.length - 1;
      const to = `/${pathnames.slice(0, index + 1).join("/")}`;
      const displayName = value
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      items.push({ name: displayName, path: to, isLast: last });
    });
    return items;
  }, [location.pathname]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        borderBottom: "none",
        boxShadow: "none",
        backgroundColor: "background.default",
        color: "text.primary",
        flexShrink: 0,
      }}
    >
      <Toolbar className="flex items-center justify-between px-6">
        <div className="flex items-center flex-grow">
          <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbItems.map((item) => (
              <MuiLink
                key={item.path}
                component={RouterLink}
                to={item.path}
                color={item.isLast ? "text.primary" : "inherit"}
                underline={item.isLast ? "none" : "hover"}
                className="text-sm"
              >
                {item.name}
              </MuiLink>
            ))}
          </Breadcrumbs>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchTerm(e.target.value)
            }
            placeholder="search city"
            variant="standard"
            slotProps={{
              input: {
                onKeyDown: handleKeyDown,
                startAdornment: (
                  <SearchIcon sx={{ color: "action.active", mr: 1 }} />
                ),
                disableUnderline: true,
              },
            }}
            sx={{ minWidth: 0, width: 300 }}
          />

          <IconButton color="inherit">
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={toggleColorMode} color="inherit">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default SearchBar;
