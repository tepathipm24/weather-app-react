import { useState } from 'react'
import './App.css'
import { LayoutDashboard, Thermometer, Wind, Droplet, Bell, BellOff } from 'lucide-react'
import Sidebar, { SidebarItem } from './components/Sidebar'

function App() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <>
    <main className='APP'>
    <Sidebar >
      <SidebarItem icon={<LayoutDashboard size={20} />} text="Weather Dashboard" active={activeIndex === 0} onClick={() => setActiveIndex(0)} />
      <SidebarItem icon={<Thermometer size={20} />} text="Temperature Updates" active={activeIndex === 1} onClick={() => setActiveIndex(1)} />
      <SidebarItem icon={<Wind size={20} />} text="Wind Speed" active={activeIndex === 2} onClick={() => setActiveIndex(2)} />
      <SidebarItem icon={<Droplet size={20} />} text="Humidity Levels" active={activeIndex === 3} onClick={() => setActiveIndex(3)} />
      <SidebarItem icon={<Bell size={20} />} text="Alerts" active={activeIndex === 4} onClick={() => setActiveIndex(4)} />
    </Sidebar>
    </main>
    </>
  )
}

export default App
