
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div style={{ display: 'flex', width: '100vw', minHeight: '100vh', padding: '24px', gap: '24px' }}>
      
      {/* Sidebar */}
      <div className="glass" style={{ width: '260px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div>
          <h2 className="text-gradient">SmartCart Core</h2>
          <p className="text-muted" style={{ fontSize: '13px', marginTop: '4px' }}>Executive Dashboard</p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <NavLink 
            to="/" 
            className={({isActive}) => isActive ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ justifyContent: 'flex-start' }}
          >
            <LayoutDashboard size={18} /> Overview
          </NavLink>
          
          <NavLink 
            to="/products" 
            className={({isActive}) => isActive ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ justifyContent: 'flex-start' }}
          >
            <Package size={18} /> Products
          </NavLink>

          <NavLink 
            to="/orders" 
            className={({isActive}) => isActive ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ justifyContent: 'flex-start' }}
          >
            <ShoppingCart size={18} /> Orders
          </NavLink>
        </nav>

        <button onClick={logout} className="btn btn-danger" style={{ justifyContent: 'flex-start' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      {/* Main View Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <Outlet />
      </main>

    </div>
  );
}
