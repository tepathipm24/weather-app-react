import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import WeatherCard from './components/WeatherCard';
import { useState } from 'react';
import './App.css';
import { LayoutDashboard, Thermometer, Wind, Droplet, Bell, BellOff } from 'lucide-react';
import Sidebar, { SidebarItem } from './components/Sidebar';
import SearchBar from './components/SearchBar';
import { ThemeProvider } from './components/ThemeContext';

function WeatherDashboard({ city }: { city: string }) {
  return <div className="px-6 h-full"><WeatherCard city={city} /></div>;
}
function TemperatureUpdates({ city }: { city: string }) {
  return <div className="px-6 h-full"><WeatherCard city={city} /></div>;
}
function WindSpeed({ city }: { city: string }) {
  return <div className="px-6 h-full"><WeatherCard city={city} /></div>;
}
function HumidityLevels({ city }: { city: string }) {
  return <div className="px-6 h-full"><WeatherCard city={city} /></div>;
}

function AppSidebar() {
  const [alerts, setAlerts] = useState(true);
  const navigate = useNavigate();
  return (
    <Sidebar>
      <SidebarItem icon={<LayoutDashboard size={20} />} text="Weather Dashboard" active={location.pathname === '/'} onClick={() => navigate('/')} />
      <SidebarItem icon={<Thermometer size={20} />} text="Temperature Updates" active={location.pathname === '/temperature'} onClick={() => navigate('/temperature')} />
      <SidebarItem icon={<Wind size={20} />} text="Wind Speed" active={location.pathname === '/wind'} onClick={() => navigate('/wind')} />
      <SidebarItem icon={<Droplet size={20} />} text="Humidity Levels" active={location.pathname === '/humidity'} onClick={() => navigate('/humidity')} />
      <SidebarItem icon={alerts ? <Bell size={20} /> : <BellOff size={20} />} text="Alerts" onClick={() => { setAlerts(!alerts); }} />
    </Sidebar>
  );
}

export default function App() {
  const [city, setCity] = useState<string>("Bangkok");
  return (
    <ThemeProvider>
      <BrowserRouter>
        <main className="APP flex h-screen overflow-hidden">
          <AppSidebar />
          <div className="flex-1 ">
            <SearchBar setCity={setCity} />
            <Routes>
              <Route path="/" element={<WeatherDashboard city={city} />} />
              <Route path="/temperature" element={<TemperatureUpdates city={city} />} />
              <Route path="/wind" element={<WindSpeed city={city} />} />
              <Route path="/humidity" element={<HumidityLevels city={city} />} />
            </Routes>
          </div>
        </main>
      </BrowserRouter>
    </ThemeProvider>
  );
}
