import { useData } from '../contexts/DataContext';
import { DollarSign, TrendingUp, TrendingDown, Clock, AlertTriangle, Calculator, Package } from 'lucide-react';

export default function Dashboard() {
  const { getInsights, orders } = useData();
  const insights = getInsights();

  const pendingOrders = orders.filter(o => o.status === 'Ordered').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ color: 'white' }}>Overview Insights</h1>
        <p className="text-muted" style={{ marginTop: '4px' }}>Welcome to the admin control panel. Dive deep into store performance.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>

        {/* Sales Card */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(0, 210, 133, 0.1)', borderRadius: '8px', color: 'var(--success)' }}>
              <DollarSign size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Overall Sales</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>${insights.totalSales.toLocaleString()}</p>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> Driven by {insights.totalOrdersCount} total orders
          </div>
        </div>

        {/* Most Popular Product */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(109, 64, 255, 0.1)', borderRadius: '8px', color: 'var(--accent-base)' }}>
              <TrendingUp size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Best Selling Product</h3>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {insights.popularProduct?.product.name || 'No Data'}
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>📦 Ordered in <strong style={{ color: 'var(--accent-base)' }}>{insights.popularProduct?.orderCount ?? 0}</strong> orders</span>
            <span>📊 {insights.popularProduct?.unitsSold ?? 0} units sold • Stock: {insights.popularProduct?.product.inventory ?? 0}</span>
          </div>
        </div>

        {/* Worst Performing */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(255, 74, 90, 0.1)', borderRadius: '8px', color: 'var(--danger)' }}>
              <TrendingDown size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Worst Performing Product</h3>
          </div>
          <p style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {insights.leastSoldProduct?.product.name || 'No Data'}
          </p>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span>📦 Ordered in <strong style={{ color: 'var(--danger)' }}>{insights.leastSoldProduct?.orderCount ?? 0}</strong> orders</span>
            <span>📊 {insights.leastSoldProduct?.unitsSold ?? 0} units sold • Unsold Stock: {insights.leastSoldProduct?.product.inventory ?? 0}</span>
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

        {/* Average Order Value */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(48, 143, 255, 0.1)', borderRadius: '8px', color: '#308fff' }}>
              <Calculator size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Average Order Value</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>${Math.round(insights.averageOrderValue).toLocaleString()}</p>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Across {insights.totalOrdersCount} orders
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '8px', background: 'rgba(248, 190, 77, 0.1)', borderRadius: '8px', color: '#f8be4d' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-muted" style={{ fontSize: '15px' }}>Low Stock Watchlist</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: insights.lowStockCount > 0 ? '#f8be4d' : 'var(--text-primary)' }}>
            {insights.lowStockCount}
          </p>
          <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Products with less than 10 units
          </div>
        </div>

      </div>
    </div>
  );
}
