import * as React from "react";
import { useState, useEffect, useMemo, memo, useCallback } from "react";

// MUI Components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { styled, alpha } from "@mui/material/styles";

// Hooks
import { useBreakpoint } from "../hooks/useBreakpoint";

// MUI Icons
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import OpacityIcon from "@mui/icons-material/Opacity";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

import { getCurrentWeather } from "../services/weatherService";
import type { WeatherApiResponse } from "../types/weatherTypes";

interface QuickSummaryCardData {
  id: number;
  title: string;
  value: string;
  subText: string;
  icon: React.ReactNode;
  color: string;
}

interface DetailedCardData {
  id: number;
  title: string;
  content: string;
  icon: React.ReactNode;
}

// Custom Styled TextField for Search Bar with seamless backgrou

// Enhanced Card with animations and transparent background
const AnimatedCard = styled(Card)(({ theme }) => ({
  backgroundColor: "transparent",
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  },
  "&:active": {
    transform: "translateY(-2px)",
  },
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(
      theme.palette.background.paper,
      0.1
    )} 0%, ${alpha(theme.palette.background.paper, 0.05)} 100%)`,
    pointerEvents: "none",
  },
}));

// เพิ่ม type สำหรับ prop color
interface IconWrapperProps {
  color?: string;
}

const IconWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isMobile',
})<IconWrapperProps & { isMobile?: boolean }>(({ theme, color, isMobile }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: isMobile ? "40px" : "48px",
  height: isMobile ? "40px" : "48px",
  borderRadius: isMobile ? "8px" : "12px",
  backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  marginBottom: theme.spacing(isMobile ? 0.5 : 1),
  transition: "all 0.3s ease",
  '& svg': {
    fontSize: isMobile ? '20px' : '24px',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "& .MuiChip-label": {
    fontWeight: 500,
  },
}));

const getUvLevel = (uvIndex: number): string => {
  if (uvIndex <= 2) return "ต่ำ";
  if (uvIndex <= 5) return "ปานกลาง";
  if (uvIndex <= 7) return "สูง";
  if (uvIndex <= 10) return "สูงมาก";
  return "รุนแรง";
};

const getUvColor = (uvIndex: number): string => {
  if (uvIndex <= 2) return "#4caf50";
  if (uvIndex <= 5) return "#ff9800";
  if (uvIndex <= 7) return "#f44336";
  if (uvIndex <= 10) return "#9c27b0";
  return "#d32f2f";
};

const getHumidityLevel = (humidity: number): string => {
  if (humidity < 30) return "แห้ง";
  if (humidity < 50) return "ปกติ";
  if (humidity < 70) return "ชื้น";
  return "ชื้นมาก";
};

// Reduced country mapping for better performance
const COMMON_COUNTRIES: { [key: string]: string } = {
  'United States': 'US', 'USA': 'US', 'US': 'US',
  'United Kingdom': 'GB', 'UK': 'GB', 'England': 'GB',
  'Germany': 'DE', 'France': 'FR', 'Japan': 'JP', 'China': 'CN',
  'Thailand': 'TH', 'Singapore': 'SG', 'Malaysia': 'MY',
  'Canada': 'CA', 'Australia': 'AU', 'India': 'IN', 'Brazil': 'BR',
};

// Utility functions for country handling
const getCountryCode = (countryName: string): string => {
  const code = COMMON_COUNTRIES[countryName];
  return code || 'UN'; // Default fallback
};

const getCountryFlag = (countryName: string): string => {
  const code = getCountryCode(countryName);
  if (code === 'UN') return '🏳️';
  
  // Convert country code to flag emoji
  return code
    .split('')
    .map(char => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

interface WeatherCardProps {
  city: string;
}

const WeatherCard = memo(function WeatherCard({ city }: WeatherCardProps): React.JSX.Element {
  const { isMobile, isTablet } = useBreakpoint();
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized fetch function to prevent unnecessary re-creations
  const fetchWeather = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCurrentWeather({ city });
      setWeatherData(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch weather data";
      setError(errorMessage);
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Data for the 4 quick summary cards
  const quickSummaryCardsData: QuickSummaryCardData[] = useMemo(() => {
    if (!weatherData || !weatherData.current) return [];

    const current = weatherData.current;

    return [
      {
        id: 1,
        title: "อุณหภูมิ",
        value: `${current.temp_c}°C`,
        subText: `รู้สึกเหมือน ${current.feelslike_c}°C`,
        icon: <ThermostatIcon sx={{ fontSize: 24 }} />,
        color:
          current.temp_c > 30
            ? "#f44336"
            : current.temp_c > 25
            ? "#ff9800"
            : "#2196f3",
      },
      {
        id: 2,
        title: "ความเร็วลม",
        value: `${current.wind_kph} km/h`,
        subText: `ทิศทาง ${current.wind_dir}`,
        icon: <AirIcon sx={{ fontSize: 24 }} />,
        color: "#00bcd4",
      },
      {
        id: 3,
        title: "ความชื้น",
        value: `${current.humidity}%`,
        subText: `อากาศ${getHumidityLevel(current.humidity)}`,
        icon: <OpacityIcon sx={{ fontSize: 24 }} />,
        color: "#3f51b5",
      },
      {
        id: 4,
        title: "ดัชนี UV",
        value: `${current.uv}`,
        subText: `ระดับ ${getUvLevel(current.uv)}`,
        icon: <WbSunnyIcon sx={{ fontSize: 24 }} />,
        color: getUvColor(current.uv),
      },
    ];
  }, [weatherData]);

  // Data for the 2 detailed cards
  const detailedCardsData: DetailedCardData[] = useMemo(() => {
    return [
      {
        id: 1,
        title: "พยากรณ์รายชั่วโมง",
        content:
          "ติดตามสภาพอากาศตลอด 24 ชั่วโมงข้างหน้า เพื่อวางแผนกิจกรรมของคุณ",
        icon: <ScheduleIcon sx={{ fontSize: 32 }} />,
      },
      {
        id: 2,
        title: "พยากรณ์ 5 วัน",
        content: "ดูแนวโน้มสภาพอากาศในสัปดาห์หน้า เพื่อเตรียมพร้อมล่วงหน้า",
        icon: <CalendarTodayIcon sx={{ fontSize: 32 }} />,
      },
    ];
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!weatherData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Alert severity="warning" sx={{ maxWidth: 400 }}>
          ไม่พบข้อมูลสภาพอากาศ
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Weather Location Header */}
      <Box
        sx={{
          px: isMobile ? 2 : isTablet ? 3 : 4,
          py: isMobile ? 2 : 3,
          textAlign: "center",
          flexShrink: 0,
          background: `linear-gradient(135deg, ${alpha('#6366f1', 0.05)} 0%, ${alpha('#8b5cf6', 0.05)} 100%)`,
          borderRadius: isMobile ? '0 0 16px 16px' : '0 0 24px 24px',
          mb: isMobile ? 1 : 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 0%, ${alpha('#6366f1', 0.1)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 1 : 1.5,
            mb: 1,
          }}>
            {/* Country Flag */}
            <Box
              component="img"
              src={`https://flagsapi.com/${getCountryCode(weatherData.location.country)}/flat/32.png`}
              alt={`${weatherData.location.country} flag`}
              onError={(e) => {
                // Fallback to emoji flag if API fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Create emoji flag as fallback
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.flag-emoji')) {
                  const flagEmoji = document.createElement('span');
                  flagEmoji.className = 'flag-emoji';
                  flagEmoji.textContent = getCountryFlag(weatherData.location.country);
                  flagEmoji.style.fontSize = isMobile ? '20px' : isTablet ? '24px' : '28px';
                  parent.appendChild(flagEmoji);
                }
              }}
              sx={{
                width: isMobile ? 24 : isTablet ? 32 : 40,
                height: isMobile ? 16 : isTablet ? 21 : 27,
                borderRadius: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                objectFit: 'cover',
              }}
            />
            
            <Typography
              variant={isMobile ? "h4" : isTablet ? "h3" : "h3"}
              component="h1"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: isMobile ? '1.75rem' : isTablet ? '2.5rem' : '3rem',
              }}
            >
              {weatherData.location.name}
            </Typography>
          </Box>
          
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="text.secondary"
            sx={{
              mb: isMobile ? 1 : 2,
              fontWeight: 400,
              fontSize: isMobile ? '0.875rem' : '1.25rem',
            }}
          >
            {weatherData.location.region}, {weatherData.location.country}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? 1 : 2,
              flexWrap: "wrap",
              mb: isMobile ? 1 : 2,
            }}
          >
            <StyledChip
              label={weatherData.current.condition.text}
              size={isMobile ? "small" : "medium"}
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                height: isMobile ? '28px' : '32px',
                '& .MuiChip-label': {
                  px: isMobile ? 1 : 2,
                }
              }}
            />
            <StyledChip
              label={`อัพเดท ${new Date(
                weatherData.current.last_updated
              ).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}`}
              size={isMobile ? "small" : "medium"}
              sx={{
                fontSize: isMobile ? '0.75rem' : '0.875rem',
                height: isMobile ? '28px' : '32px',
                '& .MuiChip-label': {
                  px: isMobile ? 1 : 2,
                }
              }}
            />
          </Box>

          {/* Current Temperature Display */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 1 : 2,
            flexDirection: isMobile ? 'column' : 'row',
          }}>
            <Box
              component="img"
              src={`https:${weatherData.current.condition.icon}`}
              alt={weatherData.current.condition.text}
              sx={{
                width: isMobile ? 48 : isTablet ? 56 : 64,
                height: isMobile ? 48 : isTablet ? 56 : 64,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}
            />
            <Typography
              variant={isMobile ? "h3" : "h2"}
              sx={{
                fontWeight: 300,
                color: 'text.primary',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: isMobile ? '2.5rem' : isTablet ? '3rem' : '3.75rem',
              }}
            >
              {weatherData.current.temp_c}°
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content Container */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          px: isMobile ? 1 : isTablet ? 2 : 0,
          pb: isMobile ? 1 : 2,
        }}
      >
        {/* Top Section: 4 Quick Summary Cards */}
        <Box
          sx={{
            mb: isMobile ? 1 : 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr" // Single column on mobile
                : isTablet
                  ? "repeat(2, 1fr)" // 2 columns on tablet
                  : "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", // Original desktop layout
              gap: isMobile ? 1 : 2,
              padding: 0,
            }}
          >
            {quickSummaryCardsData.map((card, index) => (
              <AnimatedCard
                key={card.id}
                sx={{
                  height: "100%",
                  minHeight: isMobile ? 100 : isTablet ? 110 : 120,
                  animationDelay: `${index * 0.1}s`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                  opacity: 0,
                  "@keyframes fadeInUp": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(20px)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <CardActionArea
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: isMobile ? 1.5 : 2,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: alpha(card.color, 0.08),
                      "& .icon-wrapper": {
                        transform: "scale(1.1)",
                        backgroundColor: alpha(card.color, 0.2),
                      },
                    },
                  }}
                >
                  <IconWrapper className="icon-wrapper" color={card.color} isMobile={isMobile}>
                    {card.icon}
                  </IconWrapper>
                  <Typography
                    variant={isMobile ? "subtitle1" : "h6"}
                    component="div"
                    sx={{
                      fontWeight: 500,
                      mb: 0.5,
                      fontSize: isMobile ? '0.875rem' : '1.25rem',
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    component="div"
                    sx={{
                      fontWeight: 700,
                      color: card.color,
                      fontSize: isMobile ? '1.5rem' : isTablet ? '1.75rem' : '2.125rem',
                    }}
                  >
                    {card.value}
                  </Typography>
                  <Typography
                    variant={isMobile ? "caption" : "body2"}
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                      textAlign: "center",
                      fontSize: isMobile ? '0.75rem' : '0.875rem',
                    }}
                  >
                    {card.subText}
                  </Typography>
                </CardActionArea>
              </AnimatedCard>
            ))}
          </Box>
        </Box>

        {/* Middle Section: 2 Large Detailed Cards */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: isMobile ? 1 : 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr" // Single column on mobile
                : isTablet
                  ? "1fr" // Single column on tablet too for better readability
                  : "repeat(auto-fit, minmax(min(700px, 100%), 1fr))", // Original desktop layout
              gap: isMobile ? 1 : 2,
              padding: 0,
              paddingBottom: 5.5,
            }}
          >
            {detailedCardsData.map((card, index) => (
              <AnimatedCard
                key={card.id}
                sx={{
                  height: "100%",
                  minHeight: isMobile ? 150 : isTablet ? 180 : 200,
                  animationDelay: `${(index + 4) * 0.1}s`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                  opacity: 0,
                }}
              >
                <CardActionArea
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: isMobile ? 2 : 3,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      backgroundColor: alpha("#6366f1", 0.05),
                      "& .card-icon": {
                        transform: "scale(1.1) rotate(5deg)",
                        color: "#6366f1",
                      },
                    },
                  }}
                >
                  <Box
                    className="card-icon"
                    sx={{
                      mb: isMobile ? 1 : 2,
                      color: "text.secondary",
                      transition: "all 0.3s ease",
                      '& svg': {
                        fontSize: isMobile ? '24px' : '32px',
                      },
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography
                    variant={isMobile ? "h6" : "h5"}
                    component="div"
                    sx={{
                      mb: isMobile ? 1 : 2,
                      fontWeight: 600,
                      textAlign: "center",
                      fontSize: isMobile ? '1.125rem' : isTablet ? '1.25rem' : '1.5rem',
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant={isMobile ? "body2" : "body1"}
                    color="text.secondary"
                    sx={{
                      textAlign: "center",
                      lineHeight: 1.6,
                      fontSize: isMobile ? '0.875rem' : '1rem',
                    }}
                  >
                    {card.content}
                  </Typography>
                </CardActionArea>
              </AnimatedCard>
            ))}
          </Box>
        </Box>

      </Box>
    </Box>
  );
});

export default WeatherCard;
