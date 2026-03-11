import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Car, Users, LogOut, Menu, X, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useStorage } from '@/hooks/use-storage';

const Layout = ({ children, isAdmin: propIsAdmin }: { children: React.ReactNode, isAdmin?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { schedules } = useStorage();
  
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole === 'admin';
  
  const pendingSchedules = schedules.filter(s => s.status === 'Pendente').length;

  useEffect(() => {
    if (!userRole && location.pathname !== '/login') {
      navigate('/login');
    }
    if (userRole === 'client' && propIsAdmin === true) {
      navigate('/client-dashboard');
    }
  }, [userRole, location.pathname, navigate, propIsAdmin]);

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('logged_client_plate');
    navigate('/login');
  };

  const navItems = isAdmin ? [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Orçamentos', path: '/budgets', icon: FileText },
    { label: 'Veículos', path: '/vehicles', icon: Car },
    { label: 'Agendamentos', path: '/schedules', icon: Calendar, badge: pendingSchedules },
    { label: 'Admins', path: '/admins', icon: Users },
  ] : [
    { label: 'Meu Veículo', path: '/client-dashboard', icon: Car },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="font-black text-blue-600 tracking-tighter">MECÂNICA DELIVERY</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h1 className="text-xl font-black text-blue-700 mb-8 hidden md:block tracking-tighter">MECÂNICA DELIVERY</h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg transition-colors font-bold",
                  location.pathname === item.path 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} />
                  {item.label}
                </div>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-0 w-full p-6 border-t bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
          >
            <LogOut size={20} />
            Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;