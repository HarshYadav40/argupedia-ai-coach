
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Target, Scale, Home, Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/coach', icon: Brain, label: 'AI Coach' },
    { path: '/practice', icon: Target, label: 'Practice Arena' },
    { path: '/judge', icon: Scale, label: 'Smart Judge' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-slate-50 light:via-purple-50 light:to-slate-50">
      <nav className="bg-slate-800/50 backdrop-blur-xl border-b border-purple-500/20 dark:bg-slate-800/50 light:bg-white/50 light:border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Debatify
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white dark:text-slate-300 light:text-slate-600 light:hover:bg-slate-200/50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="hidden sm:block">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-slate-300 hover:text-white light:bg-slate-200 light:hover:bg-slate-300 light:text-slate-600"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
