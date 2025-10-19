import { Sprout, Home, ListChecks, TrendingUp, User } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: 'garden' | 'habits' | 'stats' | 'profile') => void;
  theme: 'day' | 'night';
}

export function Navigation({ currentPage, onNavigate, theme }: NavigationProps) {
  const navItems = [
    { id: 'garden', label: 'Garden', icon: Home },
    { id: 'habits', label: 'Habits', icon: ListChecks },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const isDark = theme === 'night';

  return (
    <nav className={`sticky top-0 z-50 ${isDark ? 'bg-slate-800/95 border-slate-700' : 'bg-white/80 border-green-100'} backdrop-blur-md border-b shadow-sm transition-colors duration-300`}>
      <div className="max-w-[1200px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gradient-to-br from-green-600 to-emerald-700' : 'bg-gradient-to-br from-green-400 to-emerald-500'} flex items-center justify-center shadow-md transition-colors duration-300`}>
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className={`${isDark ? 'text-white' : 'text-green-900'} transition-colors duration-300`}>Habit Garden</span>
          </div>
          
          <div className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as 'garden' | 'habits' | 'stats' | 'profile')}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200
                    ${isActive 
                      ? isDark
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-green-500 text-white shadow-md'
                      : isDark
                        ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-700'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
