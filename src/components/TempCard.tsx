import React, { useState, useEffect, useMemo } from 'react';
import { Box, Card, Typography, CircularProgress, Alert, Chip } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { getTemperatureData, type TemperatureData } from '../services/weatherService';

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
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: '12px',
}));

const IconWrapper = styled(Box)<{ color?: string }>(({ theme, color }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: alpha(color || theme.palette.primary.main, 0.1),
  color: color || theme.palette.primary.main,
  marginBottom: theme.spacing(1),
}));

interface TempCardProps {
  city: string;
}

const TempCard: React.FC<TempCardProps> = ({ city }) => {
  const { isMobile } = useBreakpoint();
  const [temperatureData, setTemperatureData] = useState<TemperatureData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemperatureData = async () => {
      try {
        setLoading(true);
        const data = await getTemperatureData({ city });
        setTemperatureData(data);
        setError(null);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch temperature data";
        setError(errorMessage);
        setTemperatureData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTemperatureData();
  }, [city]);

  const chartData = useMemo(() => {
    if (!temperatureData) return [];
    return temperatureData.hourlyForecast.map((item) => ({
      time: item.time,
      temp: item.temp,
      feelsLike: item.feelsLike,
    }));
  }, [temperatureData]);

  const getTemperatureColor = (temp: number): string => {
    if (temp > 35) return "#d32f2f";
    if (temp > 30) return "#f44336";
    if (temp > 25) return "#ff9800";
    if (temp > 20) return "#4caf50";
    if (temp > 15) return "#2196f3";
    return "#9c27b0";
  };

  const getTemperatureLevel = (temp: number): string => {
    if (temp > 35) return "ร้อนจัด";
    if (temp > 30) return "ร้อน";
    if (temp > 25) return "อบอุ่น";
    if (temp > 20) return "เย็นสบาย";
    if (temp > 15) return "เย็น";
    return "หนาวเย็น";
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

  if (!temperatureData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <Alert severity="warning" sx={{ maxWidth: 400 }}>ไม่พบข้อมูลอุณหภูมิ</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header */}
      <Box sx={{ px: isMobile ? 2 : 4, py: isMobile ? 2 : 3, textAlign: "center", flexShrink: 0 }}>
        <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 700, mb: 1 }}>
          ข้อมูลอุณหภูมิ
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {city}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, px: isMobile ? 1 : 2, pb: 2, overflow: "auto" }}>
        {/* Current Temperature Stats */}
        <Box sx={{ mb: 3, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
          <StatsCard>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconWrapper color={getTemperatureColor(temperatureData.current)}>
                <ThermostatIcon />
              </IconWrapper>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: getTemperatureColor(temperatureData.current) }}>
                  {temperatureData.current}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  อุณหภูมิปัจจุบัน
                </Typography>
              </Box>
            </Box>
            <Chip 
              label={getTemperatureLevel(temperatureData.current)} 
              size="small" 
              sx={{ backgroundColor: alpha(getTemperatureColor(temperatureData.current), 0.1) }}
            />
          </StatsCard>

          <StatsCard>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconWrapper color="#ff9800">
                <ThermostatIcon />
              </IconWrapper>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#ff9800" }}>
                  {temperatureData.feelsLike}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  รู้สึกเหมือน
                </Typography>
              </Box>
            </Box>
          </StatsCard>

          <StatsCard>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconWrapper color="#f44336">
                <TrendingUpIcon />
              </IconWrapper>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#f44336" }}>
                  {temperatureData.max}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  สูงสุดวันนี้
                </Typography>
              </Box>
            </Box>
          </StatsCard>

          <StatsCard>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <IconWrapper color="#2196f3">
                <TrendingDownIcon />
              </IconWrapper>
              <Box sx={{ ml: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#2196f3" }}>
                  {temperatureData.min}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ต่ำสุดวันนี้
                </Typography>
              </Box>
            </Box>
          </StatsCard>
        </Box>

        {/* Hourly Temperature Chart */}
        <AnimatedCard sx={{ p: isMobile ? 2 : 3, mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            อุณหภูมิรายชั่วโมง (24 ชั่วโมง)
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
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value}°C`,
                    name === 'temp' ? 'อุณหภูมิ' : 'รู้สึกเหมือน'
                  ]}
                  labelFormatter={(label: string) => `เวลา: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="temp" 
                  stroke="#f44336" 
                  strokeWidth={3}
                  dot={{ fill: '#f44336', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#f44336', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="feelsLike" 
                  stroke="#ff9800" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#ff9800', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </AnimatedCard>
      </Box>
    </Box>
  );
};

export default TempCard;