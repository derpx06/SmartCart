import { useNavigate } from 'react-router-dom';
import { useData, type Order } from '../contexts/DataContext';
import { Eye } from 'lucide-react';

export default function Orders() {
  const { orders } = useData();
  const navigate = useNavigate();

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Ordered': return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' };
      case 'On the way': return { bg: 'rgba(109, 64, 255, 0.1)', color: 'var(--accent-base)' };
      case 'Delivered': return { bg: 'rgba(0, 210, 133, 0.1)', color: 'var(--success)' };
      case 'Failed': return { bg: 'rgba(255, 74, 90, 0.1)', color: 'var(--danger)' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h1 style={{ color: 'white' }}>Order Tracking</h1>
        <p className="text-muted" style={{ marginTop: '4px' }}>Monitor customer shipments and order contents.</p>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px' }} className="text-muted">No orders found.</td></tr>
            ) : (
              orders.map(o => {
                const scheme = getStatusColor(o.status);
                const itemCount = o.items.reduce((sum, item) => sum + item.quantity, 0);
                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 500, color: 'white' }}>{o.id}</td>
                    <td>{o.customerName}</td>
                    <td className="text-muted">{o.date}</td>
                    <td>{itemCount} {itemCount === 1 ? 'item' : 'items'}</td>
                    <td style={{ fontWeight: 600 }}>${o.total.toFixed(2)}</td>
                    <td>
                      <span style={{
                        backgroundColor: scheme.bg,
                        color: scheme.color,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ padding: '6px' }} 
                        onClick={() => navigate(`/orders/${o.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
