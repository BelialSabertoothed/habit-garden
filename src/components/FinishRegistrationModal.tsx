import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { User, Sparkles } from 'lucide-react';

interface RegistrationPageProps {
  onComplete: (userData: { nickname: string; avatar: string }) => void;
}

const avatars = [
  { id: '🌱', emoji: '🌱', name: 'Seedling' },
  { id: '🌿', emoji: '🌿', name: 'Herb' },
  { id: '🌸', emoji: '🌸', name: 'Blossom' },
  { id: '🌻', emoji: '🌻', name: 'Sunflower' },
  { id: '🌺', emoji: '🌺', name: 'Hibiscus' },
  { id: '🌹', emoji: '🌹', name: 'Rose' },
  { id: '🌵', emoji: '🌵', name: 'Cactus' },
  { id: '🌳', emoji: '🌳', name: 'Tree' },
  { id: '🍀', emoji: '🍀', name: 'Clover' },
  { id: '🌾', emoji: '🌾', name: 'Grain' },
  { id: '🪴', emoji: '🪴', name: 'Potted Plant' },
  { id: '🌼', emoji: '🌼', name: 'Daisy' },
];

export function RegistrationPage({ onComplete }: RegistrationPageProps) {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(avatars[0].id);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nickname.trim().length < 2) {
      setError('Nickname must be at least 2 characters');
      return;
    }
    
    if (nickname.trim().length > 20) {
      setError('Nickname must be less than 20 characters');
      return;
    }
    
    onComplete({ nickname: nickname.trim(), avatar: selectedAvatar });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-green-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-green-900 mb-2">Welcome to Habit Garden!</h2>
            <p className="text-gray-600">Let's personalize your experience</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nickname */}
            <div className="space-y-2">
              <Label htmlFor="nickname" className="text-gray-700">
                Choose your nickname
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Enter a nickname"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setError('');
                  }}
                  className="pl-10 rounded-xl border-green-200 focus:border-green-400 focus:ring-green-400"
                  maxLength={20}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            {/* Avatar Selection */}
            <div className="space-y-3">
              <Label className="text-gray-700">Pick your avatar</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {avatars.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar.id)}
                    className={`aspect-square rounded-xl flex items-center justify-center text-3xl transition-all duration-200 ${
                      selectedAvatar === avatar.id
                        ? 'bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg scale-110 ring-4 ring-green-200'
                        : 'bg-white hover:bg-green-50 border-2 border-green-100 hover:border-green-300 hover:scale-105'
                    }`}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-6 shadow-md transition-all duration-200"
            >
              Start Growing
            </Button>
          </form>
        </div>
        
        {/* Footer note */}
        <p className="text-center mt-6 text-gray-600 text-sm">
          You can always change these later in your profile
        </p>
      </div>
    </div>
  );
}
