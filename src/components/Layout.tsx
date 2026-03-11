import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Car, Users, LogOut, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

const Layout = ({ children, isAdmin = true }: { children: React.ReactNode, isAdmin?: boolean }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = isAdmin ? [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Orçamentos', path: '/budgets', icon: FileText },
    { label: 'Veículos', path: '/vehicles', icon: Car },
    { label: 'Admins', path: '/admins', icon: Users },
  ] : [
    { label: 'Meus Veículos', path: '/client-dashboard', icon: Car },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center">
        <h1 className="font-bold text-blue-600">MECÂNICA DELIVERY</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-700 mb-8 hidden md:block">MECÂNICA DELIVERY</h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.path 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t">
          <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
            Sair
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;