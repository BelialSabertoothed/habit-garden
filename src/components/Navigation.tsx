import {
  Sprout,
  Home,
  ListChecks,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavigationProps {
  currentPage: "garden" | "habits" | "stats" | "profile";
  onNavigate: (page: "garden" | "habits" | "stats" | "profile") => void;
  onLogout: () => void; // ← NOVÉ
  theme: "day" | "night";
}

export function Navigation({
  currentPage,
  onNavigate,
  onLogout,
  theme,
}: NavigationProps) {
  const navItems = [
    { id: "garden", label: "Garden", icon: Home },
    { id: "habits", label: "Habits", icon: ListChecks },
    { id: "stats", label: "Stats", icon: TrendingUp },
    { id: "profile", label: "Profile", icon: User },
  ] as const;

  const isDark = theme === "night";

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`hidden md:block sticky top-0 z-50 ${
          isDark
            ? "bg-slate-800/95 border-slate-700"
            : "bg-white/80 border-green-100"
        } backdrop-blur-md border-b shadow-sm transition-colors duration-300`}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full ${
                  isDark
                    ? "bg-gradient-to-br from-green-600 to-emerald-700"
                    : "bg-gradient-to-br from-green-400 to-emerald-500"
                } flex items-center justify-center shadow-md transition-colors duration-300`}
              >
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span
                className={`${
                  isDark ? "text-white" : "text-green-900"
                } transition-colors duration-300`}
              >
                Habit Garden
              </span>
            </div>

            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`
                      flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-200
                      ${
                        isActive
                          ? isDark
                            ? "bg-green-600 text-white shadow-md"
                            : "bg-green-500 text-white shadow-md"
                          : isDark
                          ? "text-gray-300 hover:bg-slate-700 hover:text-white"
                          : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-4">
                <LanguageSwitcher />
              </div>

              {/* Logout button */}
              <button
                onClick={onLogout}
                className={`
                  ml-2 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200
                  ${
                    isDark
                      ? "border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                      : "border-green-200 text-gray-700 hover:bg-green-50 hover:text-green-700"
                  }
                `}
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Header */}
      <nav
        className={`md:hidden sticky top-0 z-50 ${
          isDark
            ? "bg-slate-800/95 border-slate-700"
            : "bg-white/80 border-green-100"
        } backdrop-blur-md border-b shadow-sm transition-colors duration-300`}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full ${
                  isDark
                    ? "bg-gradient-to-br from-green-600 to-emerald-700"
                    : "bg-gradient-to-br from-green-400 to-emerald-500"
                } flex items-center justify-center shadow-md transition-colors duration-300`}
              >
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span
                className={`${
                  isDark ? "text-white" : "text-green-900"
                } transition-colors duration-300`}
              >
                Habit Garden
              </span>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <LanguageSwitcher />
            </div>

            {/* Mobile logout (ikonka) */}
            <button
              onClick={onLogout}
              className={`
                p-2 rounded-lg border
                ${
                  isDark
                    ? "border-slate-600 text-gray-300"
                    : "border-green-200 text-gray-700"
                }
              `}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation - Bottom Bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 ${
          isDark
            ? "bg-slate-800/95 border-slate-700"
            : "bg-white/95 border-green-100"
        } backdrop-blur-md border-t shadow-lg transition-colors duration-300`}
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? isDark
                        ? "bg-green-600 text-white"
                        : "bg-green-500 text-white"
                      : isDark
                      ? "text-gray-400 hover:bg-slate-700 hover:text-white"
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
