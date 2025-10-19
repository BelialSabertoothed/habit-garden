import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { HabitCard } from './HabitCard';
import { AddHabitModal } from './AddHabitModal';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface HabitsListProps {
  theme: 'day' | 'night';
}

type Category = 'All' | 'Health' | 'Eco' | 'Productivity' | 'Relationships';

export function HabitsList({ theme }: HabitsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [showModal, setShowModal] = useState(false);
  const isDark = theme === 'night';

  const habits = [
    { id: 1, name: 'Morning Meditation', category: 'Health' as const, frequency: 'Daily' as const, xpReward: 50 },
    { id: 2, name: 'Drink 8 Glasses of Water', category: 'Health' as const, frequency: 'Daily' as const, xpReward: 30 },
    { id: 3, name: 'Use Reusable Bags', category: 'Eco' as const, frequency: 'Daily' as const, xpReward: 40 },
    { id: 4, name: 'Deep Work Session', category: 'Productivity' as const, frequency: 'Daily' as const, xpReward: 60 },
    { id: 5, name: 'Call Family', category: 'Relationships' as const, frequency: 'Weekly' as const, xpReward: 50 },
    { id: 6, name: '30 Min Exercise', category: 'Health' as const, frequency: 'Daily' as const, xpReward: 50 },
    { id: 7, name: 'Compost Waste', category: 'Eco' as const, frequency: 'Daily' as const, xpReward: 35 },
    { id: 8, name: 'Read for 30 Minutes', category: 'Productivity' as const, frequency: 'Daily' as const, xpReward: 40 },
    { id: 9, name: 'Date Night', category: 'Relationships' as const, frequency: 'Weekly' as const, xpReward: 60 },
  ];

  const categories: Category[] = ['All', 'Health', 'Eco', 'Productivity', 'Relationships'];

  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || habit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={isDark ? 'text-white' : 'text-gray-900'}>All Habits</h2>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Manage and track your daily routines</p>
        </div>
        <Button 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-md"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Custom Habit
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <Input
            placeholder="Search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`pl-12 rounded-full ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-gray-400' : 'bg-white'}`}
          />
        </div>

        <div className="flex items-center gap-3">
          <Filter className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className={`
                  cursor-pointer rounded-full px-4 py-1.5 transition-all duration-200
                  ${selectedCategory === category
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : isDark
                      ? 'border-slate-600 text-gray-300 hover:bg-slate-700'
                      : 'hover:bg-gray-100'
                  }
                `}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Habits Grid */}
      <div className="grid gap-4">
        {filteredHabits.map((habit) => (
          <HabitCard
            key={habit.id}
            name={habit.name}
            category={habit.category}
            frequency={habit.frequency}
            xpReward={habit.xpReward}
            theme={theme}
          />
        ))}
      </div>

      {filteredHabits.length === 0 && (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>No habits found matching your search.</p>
        </div>
      )}

      <AddHabitModal open={showModal} onClose={() => setShowModal(false)} theme={theme} />
    </div>
  );
}
