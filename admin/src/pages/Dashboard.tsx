
import { useData } from '../contexts/DataContext';
import { IndianRupee, TrendingUp, TrendingDown, Clock } from 'lucide-react';

export default function Dashboard() {
  const { getInsights, orders } = useData();
  const insights = getInsights();
  
  const pendingOrders = orders.filter(o => o.status === 'Ordered').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ color: 'white' }}>Overview Insights</h1>
        <p className="text-muted" style={{ marginTop: '4px' }}>Welcome to the admin control panel.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Sales Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(0, 210, 133, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
              <IndianRupee size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Overall Sales</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>₹{insights.totalSales.toLocaleString()}</p>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> +12% from last month (mock)
          </div>
        </div>

        {/* Popular Product */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(109, 64, 255, 0.1)', borderRadius: '8px', color: 'var(--accent-base)' }}>
              <TrendingUp size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Most Popular Product</h3>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {insights.popularProduct?.name || 'No Data'}
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Inventory Left: {insights.popularProduct?.inventory ?? 0}
          </div>
        </div>

        {/* Least Sold */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(255, 74, 90, 0.1)', borderRadius: '8px', color: 'var(--danger)' }}>
              <TrendingDown size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Least Sold Product</h3>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {insights.leastSoldProduct?.name || 'No Data'}
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Inventory Left: {insights.leastSoldProduct?.inventory ?? 0}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'var(--text-primary)' }}>
              <Clock size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Pending Shipments</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{pendingOrders}</p>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Require attention immediately
          </div>
        </div>

      </div>
    </div>
  );
}
