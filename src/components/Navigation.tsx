import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Gauge,
  Vibrate,
  ThermometerSnowflake,
  Terminal,
  Info,
} from 'lucide-react';

export type TabId =
  | 'overview'
  | 'live-sensors'
  | 'motor-rpm'
  | 'vibration'
  | 'temp-humidity'
  | 'logs'
  | 'about';

interface NavigationProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  unreadLogsCount?: number;
}

interface NavItem {
  id: TabId;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  unreadLogsCount,
}) => {
  const items: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'live-sensors', label: 'Live Sensors', icon: Activity },
    { id: 'motor-rpm', label: 'Motor & RPM', icon: Gauge },
    { id: 'vibration', label: 'Vibration Analysis', icon: Vibrate },
    { id: 'temp-humidity', label: 'Temperature', icon: ThermometerSnowflake },
    { id: 'logs', label: 'System Logs', icon: Terminal, badge: unreadLogsCount },
    { id: 'about', label: 'About Project', icon: Info },
  ];

  return (
    <nav className="w-full bg-[#0a0f1d] border-b border-slate-800/80 px-4 lg:px-8 py-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center space-x-1 sm:space-x-2 min-w-max">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 relative ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                }`}
              />
              <span>{item.label}</span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
