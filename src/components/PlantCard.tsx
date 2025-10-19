import { Droplet, Sprout, Leaf, Flower2, TreeDeciduous } from 'lucide-react';
import { Button } from './ui/button';

interface PlantCardProps {
  habitName: string;
  growthStage: 'seed' | 'sprout' | 'flower' | 'tree';
  streak: number;
  onWater: () => void;
  theme: 'day' | 'night';
}

const stageConfig = {
  seed: { icon: Sprout, color: 'from-amber-200 to-amber-300', progress: 25 },
  sprout: { icon: Leaf, color: 'from-green-300 to-green-400', progress: 50 },
  flower: { icon: Flower2, color: 'from-pink-300 to-rose-400', progress: 75 },
  tree: { icon: TreeDeciduous, color: 'from-emerald-400 to-green-500', progress: 100 },
};

export function PlantCard({ habitName, growthStage, streak, onWater, theme }: PlantCardProps) {
  const stage = stageConfig[growthStage];
  const Icon = stage.icon;
  const isDark = theme === 'night';

  return (
    <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-green-100'} rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border`}>
      <div className="flex flex-col items-center gap-4">
        {/* Fixed size container for icon */}
        <div className="w-20 h-20 flex items-center justify-center">
          <div className={`bg-gradient-to-br ${stage.color} rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${
            growthStage === 'seed' ? 'w-12 h-12' :
            growthStage === 'sprout' ? 'w-14 h-14' :
            growthStage === 'flower' ? 'w-16 h-16' :
            'w-20 h-20'
          }`}>
            <Icon className={`text-white ${
              growthStage === 'seed' ? 'w-6 h-6' :
              growthStage === 'sprout' ? 'w-7 h-7' :
              growthStage === 'flower' ? 'w-9 h-9' :
              'w-12 h-12'
            }`} />
          </div>
        </div>
        
        <div className="w-full">
          <div className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-gray-100'} rounded-full overflow-hidden mb-2`}>
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${stage.progress}%` }}
            />
          </div>
          <p className={`text-center mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{habitName}</p>
          <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>🔥 {streak} day streak</p>
        </div>
        
        <Button
          onClick={onWater}
          className="w-full bg-gradient-to-r from-blue-400 to-cyan-400 hover:from-blue-500 hover:to-cyan-500 text-white rounded-full shadow-sm transition-all duration-200"
        >
          <Droplet className="w-4 h-4 mr-2" />
          Water Plant
        </Button>
      </div>
    </div>
  );
}