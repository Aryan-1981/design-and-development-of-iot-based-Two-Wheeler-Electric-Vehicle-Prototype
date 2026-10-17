import React, { useCallback, useRef } from 'react';
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

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'temp-humidity', label: 'Temperature', icon: Thermometer },
  { id: 'accelerometer', label: 'Accelerometer', icon: Vibrate },
  { id: 'gyroscope', label: 'Gyroscope', icon: Compass },
  { id: 'rpm', label: 'RPM Monitoring', icon: Gauge },
  { id: 'servo', label: 'Servo Monitoring', icon: Sliders },
  { id: 'voltage-current', label: 'Voltage & Current', icon: Zap },
  { id: 'logs', label: 'System Logs', icon: Terminal },
  { id: 'about', label: 'About Project', icon: Info },
];

/**
 * Section navigation. Desktop: full tab row. Small screens: horizontally
 * scrollable tab strip (snap-aligned) — never an unreadably squeezed row.
 * Implements tablist keyboard semantics (←/→/Home/End).
 */
export const DashboardNav: React.FC<DashboardNavProps> = ({
  activeSection,
  onSelectSection,
  unreadLogsCount,
}) => {
  const listRef = useRef<HTMLDivElement | null>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();

      const currentIndex = NAV_ITEMS.findIndex((item) => item.id === activeSection);
      let nextIndex = currentIndex;
      if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % NAV_ITEMS.length;
      if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + NAV_ITEMS.length) % NAV_ITEMS.length;
      if (e.key === 'Home') nextIndex = 0;
      if (e.key === 'End') nextIndex = NAV_ITEMS.length - 1;

      const next = NAV_ITEMS[nextIndex];
      onSelectSection(next.id);
      listRef.current
        ?.querySelector<HTMLButtonElement>(`[data-nav-id="${next.id}"]`)
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    },
    [activeSection, onSelectSection]
  );

  return (
    <nav
      className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
      aria-label="Dashboard sections"
    >
      <div
        ref={listRef}
        role="tablist"
        aria-label="Telemetry sections"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto no-scrollbar max-w-7xl mx-auto"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`nav-tab-${item.id}`}
              aria-selected={isActive}
              aria-controls={`nav-panel-${item.id}`}
              tabIndex={isActive ? 0 : -1}
              data-nav-id={item.id}
              data-cursor="SWITCH"
              onClick={() => onSelectSection(item.id)}
              className={`relative flex items-center gap-1.5 px-2.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 scroll-ml-3 ${
                isActive
                  ? 'bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 border border-sky-200/90 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600' : 'text-slate-400'}`}
                aria-hidden="true"
              />
              <span>{item.label}</span>
              {item.id === 'logs' && typeof unreadLogsCount === 'number' && unreadLogsCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-sky-100 text-sky-800 border border-sky-200 font-semibold tabular-nums">
                  {unreadLogsCount > 99 ? '99+' : unreadLogsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
