import { Heart, Leaf, Briefcase, Users, MoreVertical } from 'lucide-react';
import { Badge } from './ui/badge';

interface HabitCardProps {
  name: string;
  category: 'Health' | 'Eco' | 'Productivity' | 'Relationships';
  frequency: 'Daily' | 'Weekly';
  xpReward: number;
  theme: 'day' | 'night';
}

const categoryConfig = {
  Health: { icon: Heart, color: 'bg-red-100 text-red-700 border-red-200' },
  Eco: { icon: Leaf, color: 'bg-green-100 text-green-700 border-green-200' },
  Productivity: { icon: Briefcase, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  Relationships: { icon: Users, color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

const categoryConfigDark = {
  Health: { icon: Heart, color: 'bg-red-900/30 text-red-400 border-red-800' },
  Eco: { icon: Leaf, color: 'bg-green-900/30 text-green-400 border-green-800' },
  Productivity: { icon: Briefcase, color: 'bg-blue-900/30 text-blue-400 border-blue-800' },
  Relationships: { icon: Users, color: 'bg-purple-900/30 text-purple-400 border-purple-800' },
};

export function HabitCard({ name, category, frequency, xpReward, theme }: HabitCardProps) {
  const isDark = theme === 'night';
  const config = isDark ? categoryConfigDark[category] : categoryConfig[category];
  const Icon = config.icon;

  return (
    <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 border`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center border`}>
            <Icon className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className={`mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`rounded-full ${isDark ? 'bg-slate-700 text-gray-300' : ''}`}>
                {frequency}
              </Badge>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>+{xpReward} XP</span>
            </div>
          </div>
        </div>
        
        <button className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
