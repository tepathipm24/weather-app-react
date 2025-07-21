// src/components/SearchBar.tsx
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { useThemeContext } from "./ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useLocationSearch } from "../hooks/useLocationSearch";
import MobileMenuButton from "./MobileMenuButton";

// MUI Components
import {
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  IconButton,
  Badge,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// MUI Icons
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

// Interfaces
interface BreadcrumbItem {
  name: string;
  path: string;
  isLast?: boolean;
}

// Optimized Styled Components
const SearchContainer = styled(Box)({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
});

const SearchInput = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
  "& .MuiInputBase-root": {
    borderRadius: 9999,
    height: isMobile ? 36 : 40,
    paddingLeft: 10,
    backgroundColor: "transparent",
    border: `2px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[1],
    transition: theme.transitions.create(['border-color', 'background-color']),
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
    },
    "&.Mui-focused": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.selected,
    },
  },
  "& input": {
    padding: isMobile ? "6px 10px" : "8px 12px",
    fontSize: isMobile ? 14 : 16,
    "&::placeholder": {
      color: theme.palette.text.secondary,
      opacity: 0.7,
    },
  },
  width: isMobile ? 200 : 300,
  minWidth: isMobile ? 150 : 200,
  [theme.breakpoints.down('sm')]: {
    width: 180,
    minWidth: 120,
  },
}));

const AutocompleteDropdown = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})<{ isMobile?: boolean }>(({ theme, isMobile }) => ({
  position: 'absolute',
  top: '100%',
  left: 0,
  right: 0,
  zIndex: theme.zIndex.modal,
  maxHeight: isMobile ? 200 : 300,
  overflowY: 'auto',
  marginTop: 4,
  borderRadius: 12,
  boxShadow: theme.shadows[8],
  border: `1px solid ${theme.palette.divider}`,
}));

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

interface SearchBarProps {
  setCity: (city: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

function SearchBar({ setCity, onMobileMenuToggle, isMobileMenuOpen = false }: SearchBarProps) {
  const location = useLocation();
  const { mode, toggleColorMode } = useThemeContext();
  const { isMobile } = useBreakpoint();
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

  // Optimized event handlers with useCallback
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setCity(searchQuery.trim());
      setShowDropdown(false);
      clearSuggestions();
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }, [searchQuery, setCity, clearSuggestions]);

  const handleLocationSelect = useCallback((locationName: string, country: string) => {
    const fullLocationName = `${locationName}, ${country}`;
    setCity(fullLocationName);
    setSearchQuery(fullLocationName);
    setShowDropdown(false);
    clearSuggestions();
  }, [setCity, setSearchQuery, clearSuggestions]);

  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
    }
  }, [suggestions.length]);

  // Handle click outside to close dropdown
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  // Show dropdown when there are suggestions
  useEffect(() => {
    setShowDropdown(suggestions.length > 0 || isLoading);
  }, [suggestions.length, isLoading]);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const pathnames = location.pathname.split("/").filter(Boolean);
    const items: BreadcrumbItem[] = [
      { name: "Overview", path: "/", isLast: pathnames.length === 0 },
    ];

    pathnames.forEach((value, index) => {
      const isLast = index === pathnames.length - 1;
      const path = `/${pathnames.slice(0, index + 1).join("/")}`;
      const name = value
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      items.push({ name, path, isLast });
    });
    return items;
  }, [location.pathname]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: "background.default",
        color: "text.primary",
        flexShrink: 0,
      }}
    >
      <Toolbar
        sx={{
          px: isMobile ? 2 : 3,
          minHeight: isMobile ? 56 : 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* Left Section: Mobile Menu Button + Breadcrumbs */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
          {isMobile && onMobileMenuToggle && (
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onClick={onMobileMenuToggle}
            />
          )}
          
          {!isMobile && (
            <Breadcrumbs aria-label="breadcrumb" sx={{ flexGrow: 1, minWidth: 0 }}>
              {breadcrumbItems.map((item) => (
                <MuiLink
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  color={item.isLast ? "text.primary" : "inherit"}
                  underline={item.isLast ? "none" : "hover"}
                  sx={{
                    fontSize: 14,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.name}
                </MuiLink>
              ))}
            </Breadcrumbs>
          )}
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
                      fontSize: isMobile ? 18 : 20,
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
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Searching...
                    </Typography>
                  </Box>
                ) : suggestions.length > 0 ? (
                  <List disablePadding>
                    {suggestions.map((location) => (
                      <LocationItem
                        key={`${location.id}-${location.name}-${location.country}`}
                        onClick={() => handleLocationSelect(location.name, location.country)}
                      >
                        <LocationOnIcon sx={{ mr: 1, color: 'action.active', fontSize: 18 }} />
                        <ListItemText
                          primary={location.name}
                          secondary={`${location.region}, ${location.country}`}
                          primaryTypographyProps={{
                            fontSize: isMobile ? 14 : 15,
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: isMobile ? 12 : 13,
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
            sx={{ minWidth: isMobile ? 40 : 44, minHeight: isMobile ? 40 : 44 }}
          >
            <Badge badgeContent={notificationCount} color="error">
              <NotificationsIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
            </Badge>
          </IconButton>

          <IconButton
            onClick={toggleColorMode}
            color="inherit"
            size={isMobile ? "small" : "medium"}
            sx={{ minWidth: isMobile ? 40 : 44, minHeight: isMobile ? 40 : 44 }}
          >
            {mode === "dark" ? (
              <LightModeIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: isMobile ? 18 : 20 }} />
            )}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default SearchBar;
