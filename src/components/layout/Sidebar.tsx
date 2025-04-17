
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  ShoppingCart, 
  DollarSign, 
  BarChart2, 
  LogOut,
  Coffee 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/purchases', label: 'Purchases', icon: ShoppingCart },
    { path: '/sales', label: 'Sales', icon: DollarSign },
  ];
  
  return (
    <div className="h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Coffee className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">Brew Byte</h1>
        </div>
        <p className="text-sm text-sidebar-foreground/70 mt-1">Cafe Management</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                  location.pathname === item.path && "bg-sidebar-accent text-sidebar-foreground font-medium"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/90 hover:text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={logout}
        >
          <LogOut className="h-5 w-5 mr-2" />
          <span>Log out</span>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
