import React from 'react';
import {
  LayoutDashboard,
  Thermometer,
  Vibrate,
  Compass,
  Gauge,
  Sliders,
  Zap,
  Terminal,
  Info,
} from 'lucide-react';

export type NavSection =
  | 'overview'
  | 'temp-humidity' // Keep internal key compatible with App.tsx, but displays strictly as 'Temperature'
  | 'accelerometer'
  | 'gyroscope'
  | 'rpm'
  | 'servo'
  | 'voltage-current'
  | 'logs'
  | 'about';

interface DashboardNavProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  unreadLogsCount?: number;
}

export const DashboardNav: React.FC<DashboardNavProps> = ({
  activeSection,
  onSelectSection,
  unreadLogsCount,
}) => {
  const navItems: { id: NavSection; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'temp-humidity', label: 'Temperature', icon: Thermometer },
    { id: 'accelerometer', label: 'Accelerometer', icon: Vibrate },
    { id: 'gyroscope', label: 'Gyroscope', icon: Compass },
    { id: 'rpm', label: 'RPM Monitoring', icon: Gauge },
    { id: 'servo', label: 'Servo Monitoring', icon: Sliders },
    { id: 'voltage-current', label: 'Voltage & Current', icon: Zap },
    { id: 'logs', label: 'System Logs', icon: Terminal, badge: unreadLogsCount },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-2.5 overflow-x-auto no-scrollbar shadow-sm">
      <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-max max-w-7xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              data-cursor="SWITCH"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-indigo-50/90 text-indigo-700 border border-indigo-200/90 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
