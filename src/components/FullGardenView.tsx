import { Sprout, Leaf, Flower2, TreeDeciduous } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Habit {
  id: number;
  name: string;
  stage: 'seed' | 'sprout' | 'flower' | 'tree';
  streak: number;
}

interface FullGardenViewProps {
  habits: Habit[];
  theme: 'day' | 'night';
}

const stageConfig = {
  seed: { icon: Sprout, color: 'from-amber-200 to-amber-300', size: 'w-8 h-8', iconSize: 'w-4 h-4' },
  sprout: { icon: Leaf, color: 'from-green-300 to-green-400', size: 'w-10 h-10', iconSize: 'w-5 h-5' },
  flower: { icon: Flower2, color: 'from-pink-300 to-rose-400', size: 'w-12 h-12', iconSize: 'w-6 h-6' },
  tree: { icon: TreeDeciduous, color: 'from-emerald-400 to-green-500', size: 'w-16 h-16', iconSize: 'w-8 h-8' },
};

export function FullGardenView({ habits, theme }: FullGardenViewProps) {
  const isDark = theme === 'night';
  
  // Calculate overall progress
  const totalProgress = habits.reduce((acc, habit) => {
    const stageValues = { seed: 25, sprout: 50, flower: 75, tree: 100 };
    return acc + stageValues[habit.stage];
  }, 0);
  
  const averageProgress = habits.length > 0 ? Math.round(totalProgress / habits.length) : 0;

  return (
    <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200'} rounded-2xl p-8 shadow-md border transition-all duration-300`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Complete Garden</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {habits.length} {habits.length === 1 ? 'plant' : 'plants'} growing • {averageProgress}% average growth
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${isDark ? 'bg-slate-700' : 'bg-white/80'} border ${isDark ? 'border-slate-600' : 'border-green-200'} shadow-sm`}>
            <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>🌱 Garden Health: {averageProgress}%</span>
          </div>
        </div>
        
        {/* Garden Visualization with Image */}
        <div className={`relative rounded-xl overflow-hidden min-h-[280px] ${isDark ? 'bg-slate-900/50' : 'bg-gradient-to-b from-sky-100/50 to-amber-50/30'} border ${isDark ? 'border-slate-700' : 'border-green-100'}`}>
          {habits.length > 0 ? (
            <>
              {/* Garden Image with Overlay */}
              <div className="relative h-[280px]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1601144698643-075946e0fd6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBwbGFudHMlMjBncm93aW5nfGVufDF8fHx8MTc2MDgyNzM3N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Growing garden"
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isDark ? 'opacity-40 grayscale' : 'opacity-70'
                  }`}
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 ${
                  isDark 
                    ? 'bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent' 
                    : 'bg-gradient-to-t from-green-50/80 via-transparent to-sky-100/40'
                }`} />
                
                {/* Animated Progress Indicator */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`${isDark ? 'bg-slate-800/90' : 'bg-white/90'} backdrop-blur-sm rounded-2xl p-6 shadow-xl border ${isDark ? 'border-slate-700' : 'border-green-200'} transform hover:scale-105 transition-all duration-300`}>
                    <div className="text-center">
                      <div className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Garden Progress</div>
                      <div className="flex items-baseline gap-2 justify-center">
                        <span className={`text-5xl ${isDark ? 'text-green-400' : 'text-green-600'}`}>{averageProgress}</span>
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>%</span>
                      </div>
                      <div className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {averageProgress < 25 && '🌱 Just planted'}
                        {averageProgress >= 25 && averageProgress < 50 && '🌿 Sprouting nicely'}
                        {averageProgress >= 50 && averageProgress < 75 && '🌸 Blooming beautifully'}
                        {averageProgress >= 75 && '🌳 Flourishing garden'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className={`${isDark ? 'text-gray-500' : 'text-gray-400'} mb-2`}>Your garden is empty</p>
                <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Add your first habit to start growing!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Garden Stats */}
        <div className="grid grid-cols-4 gap-4">
          {Object.entries({ seed: 0, sprout: 0, flower: 0, tree: 0 }).map(([stage]) => {
            const count = habits.filter(h => h.stage === stage).length;
            const config = stageConfig[stage as keyof typeof stageConfig];
            const Icon = config.icon;
            
            return (
              <div key={stage} className={`${isDark ? 'bg-slate-700/50' : 'bg-white/60'} rounded-lg p-3 text-center border ${isDark ? 'border-slate-600' : 'border-green-100'}`}>
                <Icon className={`w-5 h-5 mx-auto mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} capitalize`}>{stage}{count !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}