import { useState } from 'react';
import { Heart, Leaf, Briefcase, Users, } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  theme: 'day' | 'night';
}

const icons = [
  { id: 'health', icon: Heart, label: 'Health' },
  { id: 'eco', icon: Leaf, label: 'Eco' },
  { id: 'productivity', icon: Briefcase, label: 'Productivity' },
  { id: 'relationships', icon: Users, label: 'Relationships' },
];

const predefinedCategories = ['Health', 'Eco', 'Productivity', 'Relationships', 'Custom'];

export function AddHabitModal({ open, onClose, theme }: AddHabitModalProps) {
  const [selectedIcon, setSelectedIcon] = useState('health');
  const [selectedCategory, setSelectedCategory] = useState('Health');
  const [customCategory, setCustomCategory] = useState('');
  const isDark = theme === 'night';

  const isCustomCategory = selectedCategory === 'Custom';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white'} rounded-2xl max-w-md`}>
        <DialogHeader>
          <DialogTitle className={isDark ? 'text-white' : ''}>Add Custom Habit</DialogTitle>
          <DialogDescription className={isDark ? 'text-gray-400' : ''}>
            Create a new habit to add to your garden.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name" className={isDark ? 'text-gray-300' : ''}>Habit Name</Label>
            <Input 
              id="habit-name" 
              placeholder="e.g., Morning yoga"
              className={`rounded-lg ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-400' : ''}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label className={isDark ? 'text-gray-300' : ''}>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className={`rounded-lg ${isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}>
                {predefinedCategories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isCustomCategory && (
              <Input
                placeholder="Enter custom category"
                className={`rounded-lg ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder:text-gray-400' : ''}`}
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label className={isDark ? 'text-gray-300' : ''}>Frequency</Label>
            <Select defaultValue="Daily">
              <SelectTrigger className={`rounded-lg ${isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={isDark ? 'bg-slate-700 border-slate-600 text-white' : ''}>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className={isDark ? 'text-gray-300' : ''}>Icon</Label>
            <div className="grid grid-cols-4 gap-3">
              {icons.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedIcon(item.id)}
                    className={`
                      p-4 rounded-xl border-2 transition-all duration-200
                      ${selectedIcon === item.id
                        ? 'border-green-500 bg-green-50'
                        : isDark 
                          ? 'border-slate-600 bg-slate-700 hover:border-slate-500'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 mx-auto ${selectedIcon === item.id ? 'text-green-600' : isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 pt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className={`flex-1 rounded-full ${isDark ? 'border-slate-600 text-gray-300 hover:bg-slate-700' : ''}`}
          >
            Cancel
          </Button>
          <Button 
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full"
          >
            Create Habit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}