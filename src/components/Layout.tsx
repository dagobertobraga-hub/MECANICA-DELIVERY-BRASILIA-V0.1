import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Car, Users, LogOut, Menu, X, Calendar, UserCheck, BarChart3, MessageCircle, ArrowLeft, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useStorage } from '@/hooks/use-storage';

const Layout = ({ children, isAdmin: propIsAdmin }: { children: React.ReactNode, isAdmin?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { schedules, budgets, vehicles } = useStorage();
  
  const userRole = localStorage.getItem('user_role');
  const isAdmin = userRole === 'admin';
  
  // Contadores para Badges
  const pendingSchedules = schedules.filter(s => s.status === 'Pendente').length;
  const pendingBudgets = budgets.filter(b => ['Aberto', 'Em Negociação'].includes(b.status)).length;
  const overdueVehicles = vehicles.filter(v => (v.lastOilChangeKm + v.oilIntervalKm) <= v.currentKm).length;

  useEffect(() => {
    if (!userRole && location.pathname !== '/login') {
      navigate('/login');
    }
  }, [userRole, location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('logged_client_plate');
    navigate('/login');
  };

  const handleSupportWhatsApp = () => {
    const msg = "Olá! Gostaria de suporte sobre o sistema da Mecânica Delivery Brasília.";
    window.open(`https://wa.me/5561991386470?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const navItems = isAdmin ? [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Orçamentos', path: '/budgets', icon: FileText, badge: pendingBudgets, badgeColor: 'bg-amber-500' },
    { label: 'Veículos', path: '/vehicles', icon: Car, badge: overdueVehicles, badgeColor: 'bg-red-500' },
    { label: 'Clientes', path: '/clients', icon: UserCircle },
    { label: 'Agendamentos', path: '/schedules', icon: Calendar, badge: pendingSchedules, badgeColor: 'bg-blue-500' },
    { label: 'Equipe', path: '/professionals', icon: UserCheck },
    { label: 'Relatórios', path: '/reports', icon: BarChart3 },
    { label: 'Admins', path: '/admins', icon: Users },
  ] : [
    { label: 'Meu Veículo', path: '/client-dashboard', icon: Car },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
            <ArrowLeft size={20} />
          </Button>
          <h1 className="font-black text-blue-600 tracking-tighter">MECÂNICA DELIVERY</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-8 hidden md:flex">
            <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-8 w-8 border-slate-200 text-slate-400 hover:text-blue-600">
              <ArrowLeft size={16} />
            </Button>
            <h1 className="text-xl font-black text-blue-700 tracking-tighter">MECÂNICA DELIVERY</h1>
          </div>
          
          <nav className="space-y-2 flex-1">
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
                  <span className={cn(
                    "text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse",
                    item.badgeColor || "bg-red-500"
                  )}>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            
            <button 
              onClick={handleSupportWhatsApp}
              className="flex items-center gap-3 w-full px-4 py-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-bold mt-4 border border-green-100"
            >
              <MessageCircle size={20} />
              Suporte WhatsApp
            </button>
          </nav>

          <div className="pt-6 border-t bg-white">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-bold"
            >
              <LogOut size={20} />
              Sair do Sistema
            </button>
          </div>
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