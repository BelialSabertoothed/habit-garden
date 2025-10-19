import { TrendingUp, Calendar, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatsGrowthLogProps {
  theme: 'day' | 'night';
}

const weeklyData = [
  { day: 'Mon', xp: 120 },
  { day: 'Tue', xp: 180 },
  { day: 'Wed', xp: 150 },
  { day: 'Thu', xp: 200 },
  { day: 'Fri', xp: 90 },
  { day: 'Sat', xp: 160 },
  { day: 'Sun', xp: 170 },
];

const heatmapData = [
  [1, 1, 0, 1, 1, 1, 0],
  [1, 1, 1, 1, 0, 1, 1],
  [1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 1],
  [1, 1, 1, 0, 1, 1, 1],
];

export function StatsGrowthLog({ theme }: StatsGrowthLogProps) {
  const isDark = theme === 'night';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={isDark ? 'text-white' : 'text-gray-900'}>Growth Log</h2>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Track your progress over time</p>
      </div>

      {/* Motivational Summary */}
      <div className={`${isDark ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-800' : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'} rounded-2xl p-6 border`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className={`mb-1 ${isDark ? 'text-white' : 'text-green-900'}`}>Great work this week!</h3>
            <p className={isDark ? 'text-gray-300' : 'text-green-700'}>
              Your garden flourished <strong>5 of 7 days</strong> this week. You earned <strong>1,070 XP</strong> and maintained a 14-day streak! 🌱
            </p>
          </div>
        </div>
      </div>

      {/* Weekly XP Chart */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-md border`}>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Weekly XP Progress</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="day" 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '14px' }}
            />
            <YAxis 
              stroke={isDark ? '#9ca3af' : '#6b7280'}
              style={{ fontSize: '14px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                border: `1px solid ${isDark ? '#475569' : '#e5e7eb'}`,
                borderRadius: '8px',
                color: isDark ? '#ffffff' : '#000000'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="xp" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Streak Heatmap */}
      <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl p-6 shadow-md border`}>
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-blue-500" />
          <h3 className={isDark ? 'text-white' : 'text-gray-900'}>Streak Heatmap</h3>
          <span className={`ml-auto text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last 35 days</span>
        </div>
        <div className="space-y-2">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex gap-2">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`
                    w-full h-10 rounded-lg transition-all duration-200
                    ${day === 1 
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-sm' 
                      : isDark
                        ? 'bg-slate-700'
                        : 'bg-gray-100'
                    }
                  `}
                  title={day === 1 ? 'Completed' : 'Missed'}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Less active</span>
          <div className="flex gap-1">
            <div className={`w-6 h-6 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`} />
            <div className="w-6 h-6 rounded bg-green-200" />
            <div className="w-6 h-6 rounded bg-green-400" />
            <div className="w-6 h-6 rounded bg-green-500" />
          </div>
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>More active</span>
        </div>
      </div>
    </div>
  );
}
