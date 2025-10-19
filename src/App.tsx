import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { Navigation } from './components/Navigation';
import { DashboardGarden } from './components/DashboardGarden';
import { HabitsList } from './components/HabitsList';
import { StatsGrowthLog } from './components/StatsGrowthLog';
import { ProfileRewards } from './components/ProfileRewards';

type Page = 'landing' | 'garden' | 'habits' | 'stats' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'day' | 'night'>('day');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage('garden');
  };

  if (!isAuthenticated) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <div className={`min-h-screen ${theme === 'night' ? 'bg-slate-900' : 'bg-gradient-to-br from-green-50 via-blue-50 to-beige-50'} transition-colors duration-300`}>
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} theme={theme} />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        {currentPage === 'garden' && <DashboardGarden theme={theme} />}
        {currentPage === 'habits' && <HabitsList theme={theme} />}
        {currentPage === 'stats' && <StatsGrowthLog theme={theme} />}
        {currentPage === 'profile' && <ProfileRewards theme={theme} onThemeChange={setTheme} />}
      </main>
    </div>
  );
}
