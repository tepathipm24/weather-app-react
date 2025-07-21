import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Typography, CircularProgress, Alert, Chip, LinearProgress } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import OpacityIcon from '@mui/icons-material/Opacity';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getHumidityData, type HumidityData } from '../services/weatherService';

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
  backgroundColor: alpha('#3f51b5', 0.05),
  border: `1px solid ${alpha('#3f51b5', 0.1)}`,
  borderRadius: '12px',
}));

const IconWrapper = styled(Box)<{ color?: string }>(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: alpha(color || '#3f51b5', 0.1),
  color: color || '#3f51b5',
  marginBottom: theme.spacing(1),
}));

const HumidityGauge = styled(Box)<{ humidity: number }>(({ humidity }) => {
  const getColor = (value: number) => {
    if (value < 30) return "#f44336";
    if (value < 50) return "#ff9800";
    if (value < 70) return "#4caf50";
    return "#2196f3";
  };

  return {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    background: `conic-gradient(${getColor(humidity)} ${humidity * 3.6}deg, #e0e0e0 ${humidity * 3.6}deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      width: '120px',
      height: '120px',
      borderRadius: '50%',
      backgroundColor: 'white',
    },
  };
});

interface HumidityCardProps {
  city: string;
}

const HumidityCard: React.FC<HumidityCardProps> = ({ city }) => {
  const { isMobile, isTablet } = useBreakpoint();
  const [humidityData, setHumidityData] = useState<HumidityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHumidityData = async () => {
      try {
        setLoading(true);
        const data = await getHumidityData({ city });
        setHumidityData(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch humidity data";
        setError(errorMessage);
        setHumidityData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchHumidityData();
  }, [city]);

  const chartData = useMemo(() => {
    if (!humidityData) return [];
    return humidityData.hourlyForecast.map((item, index) => ({
      time: item.time,
      humidity: item.humidity,
      index,
    }));
  }, [humidityData]);

  const getHumidityColor = (humidity: number): string => {
    if (humidity < 30) return "#f44336";
    if (humidity < 50) return "#ff9800";
    if (humidity < 70) return "#4caf50";
    return "#2196f3";
  };

  const getHumidityLevel = (humidity: number): string => {
    if (humidity < 30) return "แห้ง";
    if (humidity < 50) return "ปกติ";
    if (humidity < 70) return "ชื้น";
    return "ชื้นมาก";
  };

  const getHumidityDescription = (humidity: number): string => {
    if (humidity < 30) return "อากาศแห้ง อาจทำให้ผิวหนังและเยื่อบุจมูกแห้ง";
    if (humidity < 50) return "ระดับความชื้นที่เหมาะสม สบายสำหรับร่างกาย";
    if (humidity < 70) return "อากาศชื้น อาจรู้สึกอบอ้าวเล็กน้อย";
    return "อากาศชื้นมาก อาจรู้สึกอึดอัดและเหนียวเหนอะหนะ";
  };

  const pieData = useMemo(() => {
    if (!humidityData) return [];
    return [
      { name: 'ความชื้น', value: humidityData.current, fill: getHumidityColor(humidityData.current) },
      { name: 'แห้ง', value: 100 - humidityData.current, fill: '#e0e0e0' },
    ];
  }, [humidityData]);

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

  if (!humidityData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Alert severity="warning" sx={{ maxWidth: 400 }}>ไม่พบข้อมูลความชื้น</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ px: isMobile ? 2 : 4, py: isMobile ? 2 : 3, textAlign: "center", flexShrink: 0 }}>
        <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          ข้อมูลความชื้น
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {city}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, px: isMobile ? 1 : 2, pb: 2, overflow: "auto" }}>
        {/* Current Humidity Stats */}
        <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(250px, 1fr))", gap: 2 }}>
          <StatsCard>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconWrapper color={getHumidityColor(humidityData.current)}>
                <OpacityIcon />
              </IconWrapper>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: getHumidityColor(humidityData.current) }}>
                  {humidityData.current}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ความชื้นสัมพัทธ์
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={humidityData.level} 
              size="small" 
              sx={{ backgroundColor: alpha(getHumidityColor(humidityData.current), 0.1) }}
            />
          </StatsCard>

          {/* Humidity Gauge */}
          <StatsCard>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                เกจความชื้น
              </Typography>
              <HumidityGauge humidity={humidityData.current}>
                <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: getHumidityColor(humidityData.current) }}>
                    {humidityData.current}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ความชื้น
                  </Typography>
                </Box>
              </HumidityGauge>
            </Box>
          </StatsCard>

          {/* Humidity Level Progress */}
          <StatsCard>
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                ระดับความชื้น
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">แห้ง</Typography>
                  <Typography variant="body2">ชื้นมาก</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={humidityData.current} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getHumidityColor(humidityData.current),
                      borderRadius: 4,
                    }
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">0%</Typography>
                  <Typography variant="caption">50%</Typography>
                  <Typography variant="caption">100%</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {getHumidityDescription(humidityData.current)}
              </Typography>
            </Box>
          </StatsCard>
        </Box>

        {/* Hourly Humidity Chart */}
        <AnimatedCard sx={{ p: isMobile ? 2 : 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            ความชื้นรายชั่วโมง (24 ชั่วโมง)
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
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${value}%`, 
                    'ความชื้น'
                  ]}
                  labelFormatter={(label: string) => `เวลา: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#3f51b5" 
                  strokeWidth={3}
                  dot={{ fill: '#3f51b5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3f51b5', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </AnimatedCard>
      </Box>
    </Box>
  );
};

export default HumidityCard;