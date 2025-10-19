import { User, Zap, Award, Sun, Moon } from 'lucide-react';
import { BadgeIcon } from './BadgeIcon';
import { Progress } from './ui/progress';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

interface ProfileRewardsProps {
  theme: 'day' | 'night';
  onThemeChange: (theme: 'day' | 'night') => void;
}

export function ProfileRewards({ theme, onThemeChange }: ProfileRewardsProps) {
  const isDark = theme === 'night';

  const badges = [
    { type: 'firstStep', unlocked: true, name: 'First Step', description: 'Complete your first habit' },
    { type: 'weekWarrior', unlocked: true, name: 'Week Warrior', description: '7-day streak achieved' },
    { type: 'consistent', unlocked: true, name: 'Consistent', description: '30-day streak achieved' },
    { type: 'powerUser', unlocked: false, name: 'Power User', description: 'Reach level 10' },
    { type: 'legendary', unlocked: false, name: 'Legendary', description: '100-day streak' },
    { type: 'dedicated', unlocked: false, name: 'Dedicated', description: 'Complete 1000 habits' },
  ];

  const userLevel = 8;
  const totalXP = 4250;
  const xpToNextLevel = 5000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Profile & Rewards</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Track your achievements and customize your experience</p>
      </div>

      {/* Profile Card */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-md border`}>
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <User className="w-10 h-10 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Garden Enthusiast</h3>
            <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>garden.lover@email.com</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`px-4 py-2 rounded-full ${isDark ? 'bg-gradient-to-r from-green-600 to-emerald-700' : 'bg-gradient-to-r from-green-500 to-emerald-500'} text-white shadow-sm`}>
                  Level {userLevel}
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500" />
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{totalXP} Total XP</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Progress to Level {userLevel + 1}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{totalXP} / {xpToNextLevel} XP</span>
                </div>
                <Progress value={(totalXP / xpToNextLevel) * 100} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Selector */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-md border`}>
        <h3 className={`mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Theme Preferences</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-amber-500'}`} />
            <Label htmlFor="theme-switch" className={isDark ? 'text-gray-300' : 'text-gray-700'}>
              {theme === 'day' ? 'Day Mode' : 'Night Mode'}
            </Label>
            <Moon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>
          <Switch
            id="theme-switch"
            checked={theme === 'night'}
            onCheckedChange={(checked) => onThemeChange(checked ? 'night' : 'day')}
          />
        </div>
      </div>

      {/* Badges Section */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-md border`}>
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-5 h-5 text-purple-500" />
          <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Earned Badges</h3>
          <span className={`ml-auto text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {badges.filter(b => b.unlocked).length} of {badges.length} unlocked
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge, index) => (
            <BadgeIcon
              key={index}
              type={badge.type}
              unlocked={badge.unlocked}
              name={badge.name}
              description={badge.description}
              theme={theme}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
