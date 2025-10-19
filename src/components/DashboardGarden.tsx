import { useState } from 'react';
import { Plus, Zap } from 'lucide-react';
import { PlantCard } from './PlantCard';
import { AddHabitModal } from './AddHabitModal';
import { FullGardenView } from './FullGardenView';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface DashboardGardenProps {
  theme: 'day' | 'night';
}

export function DashboardGarden({ theme }: DashboardGardenProps) {
  const [habits,] = useState([
    { id: 1, name: 'Morning Meditation', stage: 'tree' as const, streak: 42 },
    { id: 2, name: 'Drink Water', stage: 'flower' as const, streak: 28 },
    { id: 3, name: 'Exercise', stage: 'sprout' as const, streak: 12 },
    { id: 4, name: 'Read 30 min', stage: 'flower' as const, streak: 21 },
    { id: 5, name: 'Journal', stage: 'seed' as const, streak: 5 },
    { id: 6, name: 'No Phone After 9pm', stage: 'sprout' as const, streak: 8 },
  ]);

  const [xp] = useState({ current: 1250, toNextLevel: 2000 });
  const [streak] = useState(14);
  const [showModal, setShowModal] = useState(false);
  const isDark = theme === 'night';

  const handleWater = (id: number) => {
    console.log('Watered habit:', id);
  };

  return (
    <div className="space-y-8">
      {/* XP and Streak */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl p-6 shadow-md border`}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>XP Progress</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-white' : 'text-gray-900'}>{xp.current} XP</span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{xp.toNextLevel} XP</span>
              </div>
              <Progress value={(xp.current / xp.toNextLevel) * 100} className="h-3" />
            </div>
          </div>
          
          <div>
            <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current Streak</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl ${isDark ? 'text-white' : 'text-green-600'}`}>{streak}</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>days 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Your Garden</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Nurture your habits and watch them grow</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-md">
          <Plus className="w-5 h-5 mr-2" />
          Add New Habit
        </Button>
      </div>

      {/* Full Garden View */}
      <FullGardenView habits={habits} theme={theme} />

      {/* Plants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits.map((habit) => (
          <PlantCard
            key={habit.id}
            habitName={habit.name}
            growthStage={habit.stage}
            streak={habit.streak}
            onWater={() => handleWater(habit.id)}
            theme={theme}
          />
        ))}
      </div>

      {/* Add Habit Modal */}
      <AddHabitModal
        open={showModal}
        onClose={() => setShowModal(false)}
        theme={theme}
      />
    </div>
  );
}