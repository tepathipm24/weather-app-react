import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PolarAngleAxis, PolarGrid, PolarRadiusAxis, RadialBarChart, RadialBar } from 'recharts';
import AirIcon from '@mui/icons-material/Air';
import ExploreIcon from '@mui/icons-material/Explore';
import SpeedIcon from '@mui/icons-material/Speed';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getWindData, type WindData } from '../services/weatherService';

const AnimatedCard = styled(Card)(({ theme }) => ({
  backgroundColor: "transparent",
  backdropFilter: "blur(10px)",
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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

const StatsCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: alpha('#00bcd4', 0.05),
  border: `1px solid ${alpha('#00bcd4', 0.1)}`,
  borderRadius: '12px',
}));

const IconWrapper = styled(Box)<{ color?: string }>(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: alpha(color || '#00bcd4', 0.1),
  color: color || '#00bcd4',
  marginBottom: theme.spacing(1),
}));

const WindCompass = styled(Box)<{ rotation: number }>(({ rotation }) => ({
  width: '120px',
  height: '120px',
  borderRadius: '50%',
  border: '2px solid #00bcd4',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha('#00bcd4', 0.05),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '10px',
    left: '50%',
    transform: `translateX(-50%) rotate(${rotation}deg)`,
    transformOrigin: 'center 50px',
    width: '3px',
    height: '40px',
    backgroundColor: '#f44336',
    borderRadius: '2px',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '5px',
    left: '50%',
    transform: `translateX(-50%) rotate(${rotation}deg)`,
    transformOrigin: 'center 55px',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderBottom: '12px solid #f44336',
  },
}));

interface WindCardProps {
  city: string;
}

const WindCard: React.FC<WindCardProps> = ({ city }) => {
  const { isMobile, isTablet } = useBreakpoint();
  const [windData, setWindData] = useState<WindData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWindData = async () => {
      try {
        setLoading(true);
        const data = await getWindData({ city });
        setWindData(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch wind data";
        setError(errorMessage);
        setWindData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWindData();
  }, [city]);

  const chartData = useMemo(() => {
    if (!windData) return [];
    return windData.hourlyForecast.map((item, index) => ({
      time: item.time,
      speed: item.speed,
      direction: item.direction,
      degree: item.degree,
      index,
    }));
  }, [windData]);

  const getWindSpeedLevel = (speed: number): string => {
    if (speed < 1) return "นิ่ง";
    if (speed < 6) return "ลมเบา";
    if (speed < 12) return "ลมเบาถึงปานกลาง";
    if (speed < 20) return "ลมปานกลาง";
    if (speed < 29) return "ลมแรง";
    if (speed < 39) return "ลมแรงมาก";
    return "พายุ";
  };

  const getWindSpeedColor = (speed: number): string => {
    if (speed < 6) return "#4caf50";
    if (speed < 12) return "#8bc34a";
    if (speed < 20) return "#ffeb3b";
    if (speed < 29) return "#ff9800";
    if (speed < 39) return "#f44336";
    return "#9c27b0";
  };

  const getDirectionInThai = (direction: string): string => {
    const directions: { [key: string]: string } = {
      'N': 'เหนือ', 'NNE': 'เหนือ-ตะวันออกเฉียงเหนือ', 'NE': 'ตะวันออกเฉียงเหนือ',
      'ENE': 'ตะวันออก-ตะวันออกเฉียงเหนือ', 'E': 'ตะวันออก', 'ESE': 'ตะวันออก-ตะวันออกเฉียงใต้',
      'SE': 'ตะวันออกเฉียงใต้', 'SSE': 'ใต้-ตะวันออกเฉียงใต้', 'S': 'ใต้',
      'SSW': 'ใต้-ตะวันตกเฉียงใต้', 'SW': 'ตะวันตกเฉียงใต้', 'WSW': 'ตะวันตก-ตะวันตกเฉียงใต้',
      'W': 'ตะวันตก', 'WNW': 'ตะวันตก-ตะวันตกเฉียงเหนือ', 'NW': 'ตะวันตกเฉียงเหนือ',
      'NNW': 'เหนือ-ตะวันตกเฉียงเหนือ'
    };
    return directions[direction] || direction;
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>{error}</Alert>
      </Box>
    );
  }

  if (!windData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Alert severity="warning" sx={{ maxWidth: 400 }}>ไม่พบข้อมูลลม</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ px: isMobile ? 2 : 4, py: isMobile ? 2 : 3, textAlign: "center", flexShrink: 0 }}>
        <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          ข้อมูลลม
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {city}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, px: isMobile ? 1 : 2, pb: 2, overflow: "auto" }}>
        {/* Current Wind Stats */}
        <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
          <StatsCard>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconWrapper color={getWindSpeedColor(windData.speed)}>
                <SpeedIcon />
              </IconWrapper>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: getWindSpeedColor(windData.speed) }}>
                  {windData.speed} km/h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ความเร็วลม
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={getWindSpeedLevel(windData.speed)} 
              size="small" 
              sx={{ backgroundColor: alpha(getWindSpeedColor(windData.speed), 0.1) }}
            />
          </StatsCard>

          <StatsCard>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconWrapper color="#00bcd4">
                <ExploreIcon />
              </IconWrapper>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#00bcd4" }}>
                  {windData.direction}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ทิศทางลม
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={getDirectionInThai(windData.direction)} 
              size="small" 
              sx={{ backgroundColor: alpha('#00bcd4', 0.1) }}
            />
          </StatsCard>

          {/* Wind Compass */}
          <StatsCard>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                เข็มทิศลม
              </Typography>
              <WindCompass rotation={windData.degree}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#00bcd4' }}>
                  {windData.degree}°
                </Typography>
              </WindCompass>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                {getDirectionInThai(windData.direction)}
              </Typography>
            </Box>
          </StatsCard>
        </Box>

        {/* Hourly Wind Chart */}
        <AnimatedCard sx={{ p: isMobile ? 2 : 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            ความเร็วลมรายชั่วโมง (24 ชั่วโมง)
          </Typography>
          <Box sx={{ height: isMobile ? 250 : 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  interval={isMobile ? 3 : 1}
                />
                <YAxis 
                  tick={{ fontSize: isMobile ? 10 : 12 }}
                  domain={[0, 'dataMax + 5']}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value} km/h`, 
                    'ความเร็วลม'
                  ]}
                  labelFormatter={(label: string) => `เวลา: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#00bcd4" 
                  strokeWidth={3}
                  dot={{ fill: '#00bcd4', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00bcd4', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </AnimatedCard>
      </Box>
    </Box>
  );
};

export default WindCard;