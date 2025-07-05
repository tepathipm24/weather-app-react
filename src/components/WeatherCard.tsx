import * as React from "react";
import { useState, useEffect, useMemo } from "react";

// MUI Components
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import { styled, alpha } from "@mui/material/styles";

// MUI Icons
import ThermostatIcon from "@mui/icons-material/Thermostat";
import AirIcon from "@mui/icons-material/Air";
import OpacityIcon from "@mui/icons-material/Opacity";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import InfoIcon from "@mui/icons-material/Info";

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

const IconWrapper = styled(Box)<IconWrapperProps>(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  marginBottom: theme.spacing(1),
  transition: "all 0.3s ease",
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

interface WeatherCardProps {
  city: string;
}

export default function WeatherCard({ city }: WeatherCardProps): React.JSX.Element {
  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (): Promise<void> => {
      try {
        setLoading(true);
        const data = await getCurrentWeather({ city });
        setWeatherData(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch weather data";
        setError(errorMessage);
        setWeatherData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [city]);

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
          px: 4,
          py: 3,
          textAlign: "center",
          flexShrink: 0,
          background: `linear-gradient(135deg, ${alpha('#6366f1', 0.05)} 0%, ${alpha('#8b5cf6', 0.05)} 100%)`,
          borderRadius: '0 0 24px 24px',
          mb: 2,
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
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            {weatherData.location.name}
          </Typography>
          
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 2, fontWeight: 400 }}
          >
            {weatherData.location.region}, {weatherData.location.country}
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 2,
            }}
          >
            <StyledChip
              label={weatherData.current.condition.text}
              size="medium"
              sx={{
                fontSize: '0.875rem',
                height: '32px',
                '& .MuiChip-label': {
                  px: 2,
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
              size="medium"
              sx={{
                fontSize: '0.875rem',
                height: '32px',
                '& .MuiChip-label': {
                  px: 2,
                }
              }}
            />
          </Box>

          {/* Current Temperature Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Box
              component="img"
              src={`https:${weatherData.current.condition.icon}`}
              alt={weatherData.current.condition.text}
              sx={{
                width: 64,
                height: 64,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              }}
            />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 300,
                color: 'text.primary',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
          px: 0,
          pb: 2,
        }}
      >
        {/* Top Section: 4 Quick Summary Cards */}
        <Box
          sx={{
            // ใช้เฉพาะเนื้อที่ที่ต้องการ ไม่กิน flex ทั้งหมด
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(250px, 100%), 1fr))",
              gap: 2,
              padding: 0,
            }}
          >
            {quickSummaryCardsData.map((card, index) => (
              <AnimatedCard
                key={card.id}
                sx={{
                  height: "100%",
                  minHeight: 120,
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
                    padding: 2,
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
                  <IconWrapper className="icon-wrapper" color={card.color}>
                    {card.icon}
                  </IconWrapper>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 500, mb: 0.5 }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 700, color: card.color }}
                  >
                    {card.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, textAlign: "center" }}
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
            flex: 1, // ขยายเต็มพื้นที่ที่เหลือ
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(700px, 100%), 1fr))",
              gap: 2,
              padding: 0,
            }}
          >
            {detailedCardsData.map((card, index) => (
              <AnimatedCard
                key={card.id}
                sx={{
                  height: "100%",
                  minHeight: 200,
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
                    padding: 3,
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
                      mb: 2,
                      color: "text.secondary",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="div"
                    sx={{ mb: 2, fontWeight: 600, textAlign: "center" }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textAlign: "center", lineHeight: 1.6 }}
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
}
