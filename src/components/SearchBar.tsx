// src/components/SearchBar.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { useThemeContext } from "./ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useLocationSearch } from "../hooks/useLocationSearch";
import MobileMenuButton from "./MobileMenuButton";

// MUI Components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

// MUI Icons
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Interfaces สำหรับ Type ของข้อมูล
interface BreadcrumbItem {
  name: string;
  path: string;
  isLast?: boolean; // Optional property
}

// Search Container with Autocomplete
const SearchContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

// Custom Styled TextField for Search Bar
const SearchInput = styled(TextField)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
  "& .MuiInputBase-root": {
    borderRadius: "9999px",
    height: isMobile ? "36px" : "40px",
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
    padding: isMobile ? "6px 10px" : "8px 12px",
    fontSize: isMobile ? "14px" : "16px",
    "&::placeholder": {
      color:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.5)"
          : "rgba(0,0,0,0.5)",
    },
  },
  width: isMobile ? "200px" : "300px",
  minWidth: isMobile ? "150px" : "200px",
  
  [theme.breakpoints.down('sm')]: {
    width: "180px",
    minWidth: "120px",
  },
}));

// Autocomplete Dropdown
const AutocompleteDropdown = styled(Paper)<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: 1300,
  maxHeight: isMobile ? '200px' : '300px',
  overflowY: 'auto',
  marginTop: '4px',
  borderRadius: '12px',
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

// Location Item in Dropdown
const LocationItem = styled(ListItem)(({ theme }) => ({
  cursor: 'pointer',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:not(:last-child)': {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
}));

// Loading Container
const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px',
});

// Responsive Breadcrumbs Container
const ResponsiveBreadcrumbs = styled(Box)<{ isMobile?: boolean }>(({ isMobile }) => ({
  display: isMobile ? 'none' : 'flex',
  alignItems: 'center',
  flexGrow: 1,
  minWidth: 0,
  
  '& .MuiBreadcrumbs-root': {
    fontSize: '14px',
  },
  
  '@media (max-width: 900px)': {
    display: isMobile ? 'none' : 'block',
    '& .MuiBreadcrumbs-root': {
      fontSize: '12px',
    },
  },
}));

interface SearchBarProps {
  setCity: (city: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

function SearchBar({ setCity, onMobileMenuToggle, isMobileMenuOpen = false }: SearchBarProps) {
  const location = useLocation();
  const { mode, toggleColorMode } = useThemeContext();
  const { isMobile, isTablet } = useBreakpoint();
  const [notificationCount] = useState<number>(5);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Use location search hook
  const {
    suggestions,
    isLoading,
    searchQuery,
    setSearchQuery,
    clearSuggestions,
  } = useLocationSearch();

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show dropdown when there are suggestions
  useEffect(() => {
    setShowDropdown(suggestions.length > 0 || isLoading);
  }, [suggestions.length, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      setCity(searchQuery.trim());
      setShowDropdown(false);
      clearSuggestions();
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleLocationSelect = (locationName: string, country: string) => {
    const fullLocationName = `${locationName}, ${country}`;
    setCity(fullLocationName);
    setSearchQuery(fullLocationName);
    setShowDropdown(false);
    clearSuggestions();
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
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
      <Toolbar
        sx={{
          px: isMobile ? 2 : 3,
          minHeight: isMobile ? '56px' : '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* Left Section: Mobile Menu Button + Breadcrumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
          {isMobile && onMobileMenuToggle && (
            <Box sx={{ mr: 1 }}>
              <MobileMenuButton
                isOpen={isMobileMenuOpen}
                onClick={onMobileMenuToggle}
              />
            </Box>
          )}
          
          <ResponsiveBreadcrumbs isMobile={isMobile}>
            <Breadcrumbs aria-label="breadcrumb">
              {breadcrumbItems.map((item) => (
                <MuiLink
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color={item.isLast ? "text.primary" : "inherit"}
                  underline={item.isLast ? "none" : "hover"}
                  sx={{
                    fontSize: isMobile ? '12px' : '14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </MuiLink>
              ))}
            </Breadcrumbs>
          </ResponsiveBreadcrumbs>
        </Box>

        {/* Right Section: Search + Actions */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 0.5 : 1,
          flexShrink: 0,
        }}>
          <SearchContainer ref={searchRef}>
            <SearchInput
              isMobile={isMobile}
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder="search city"
              variant="standard"
              slotProps={{
                input: {
                  onKeyDown: handleKeyDown,
                  startAdornment: (
                    <SearchIcon sx={{
                      color: "action.active",
                      mr: 1,
                      fontSize: isMobile ? '18px' : '20px',
                      alignItems: "center",
                    }} />
                  ),
                  disableUnderline: true,
                },
              }}
            />
            
            {/* Autocomplete Dropdown */}
            {showDropdown && (
              <AutocompleteDropdown isMobile={isMobile}>
                {isLoading ? (
                  <LoadingContainer>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Searching...
                    </Typography>
                  </LoadingContainer>
                ) : suggestions.length > 0 ? (
                  <List disablePadding>
                    {suggestions.map((location) => (
                      <LocationItem
                        key={`${location.id}-${location.name}-${location.country}`}
                        onClick={() => handleLocationSelect(location.name, location.country)}
                      >
                        <LocationOnIcon
                          sx={{
                            mr: 1,
                            color: 'action.active',
                            fontSize: '18px'
                          }}
                        />
                        <ListItemText
                          primary={location.name}
                          secondary={`${location.region}, ${location.country}`}
                          primaryTypographyProps={{
                            fontSize: isMobile ? '14px' : '15px',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: isMobile ? '12px' : '13px',
                            color: 'text.secondary',
                          }}
                        />
                      </LocationItem>
                    ))}
                  </List>
                ) : searchQuery.length >= 2 ? (
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No locations found
                    </Typography>
                  </Box>
                ) : null}
              </AutocompleteDropdown>
            )}
          </SearchContainer>

          <IconButton
            color="inherit"
            size={isMobile ? "small" : "medium"}
            sx={{
              minWidth: isMobile ? '40px' : '44px',
              minHeight: isMobile ? '40px' : '44px',
            }}
          >
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon sx={{ fontSize: isMobile ? '18px' : '20px' }} />
            </Badge>
          </IconButton>

          <IconButton
            onClick={toggleColorMode}
            color="inherit"
            size={isMobile ? "small" : "medium"}
            sx={{
              minWidth: isMobile ? '40px' : '44px',
              minHeight: isMobile ? '40px' : '44px',
            }}
          >
            {mode === "dark" ?
              <LightModeIcon sx={{ fontSize: isMobile ? '18px' : '20px' }} /> :
              <DarkModeIcon sx={{ fontSize: isMobile ? '18px' : '20px' }} />
            }
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default SearchBar;
