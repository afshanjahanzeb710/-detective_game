import { Volume2, VolumeX } from 'lucide-react';

export type NavSection = 'cover' | 'departments' | 'cases' | 'notebook';

interface TopBarProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export function TopBar({ activeSection, onNavigate, soundEnabled, onToggleSound }: TopBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#07090d]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate('cover')}
          className="font-display text-base font-bold tracking-[0.14em] text-amber-400 transition-colors hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0 sm:text-lg"
        >
          DETECTIVE ACADEMY
        </button>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            type="button"
            onClick={() => onNavigate('cover')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
              activeSection === 'cover'
                ? 'border-b border-amber-400 text-amber-300'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('departments')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
              activeSection === 'departments'
                ? 'border-b border-amber-400 text-amber-300'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Departments
          </button>
          <button
            type="button"
            onClick={() => onNavigate('cases')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
              activeSection === 'cases'
                ? 'border-b border-amber-400 text-amber-300'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Case Files
          </button>
          <button
            type="button"
            onClick={() => onNavigate('notebook')}
            className={`whitespace-nowrap shrink-0 pb-0.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400 ${
              activeSection === 'notebook'
                ? 'border-b border-amber-400 text-amber-300'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Notebook
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute soundtrack and sound effects' : 'Enable soundtrack and sound effects'}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-700/80 bg-[#0d1424] px-3.5 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-amber-500/60 hover:text-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 whitespace-nowrap shrink-0"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="h-4 w-4 text-amber-400" aria-hidden="true" />
                <span>Audio On</span>
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 text-slate-400" aria-hidden="true" />
                <span>Audio Off</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Compact mobile nav bar */}
      <nav
        aria-label="Mobile navigation"
        className="flex items-center justify-around border-t border-slate-800/70 px-2 py-2 md:hidden"
      >
        {(
          [
            { id: 'cover', label: 'Home' },
            { id: 'departments', label: 'Departments' },
            { id: 'cases', label: 'Case Files' },
            { id: 'notebook', label: 'Notebook' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`min-h-[40px] px-2.5 py-1.5 text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
              activeSection === item.id ? 'text-amber-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
