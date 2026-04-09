import { useParams, useNavigate } from 'react-router-dom';
import { useData, type Order } from '../contexts/DataContext';
import { ArrowLeft, User, Calendar, CreditCard, ChevronRight } from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useData();
  
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'white' }}>Order Not Found</h2>
        <button onClick={() => navigate('/orders')} className="btn btn-outline" style={{ marginTop: '20px' }}>
          Back to Orders
        </button>
      </div>
    );
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Pending': return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' };
      case 'Shipped': return { bg: 'rgba(109, 64, 255, 0.1)', color: 'var(--accent-base)' };
      case 'Delivered': return { bg: 'rgba(0, 210, 133, 0.1)', color: 'var(--success)' };
    }
  };

  const scheme = getStatusColor(order.status);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/orders')} className="btn btn-outline" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ color: 'white' }}>Order Details</h1>
            <p className="text-muted">ID: {order.id}</p>
          </div>
        </div>
        <select 
          value={order.status} 
          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
          style={{
            backgroundColor: scheme.bg,
            color: scheme.color,
            border: 'none',
            padding: '10px 20px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <option value="Pending" style={{ color: 'black' }}>Pending</option>
          <option value="Shipped" style={{ color: 'black' }}>Shipped</option>
          <option value="Delivered" style={{ color: 'black' }}>Delivered</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Customer & Info Cards */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <User className="text-muted" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Customer</h3>
            <p style={{ fontWeight: 600, fontSize: '18px' }}>{order.customerName}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <Calendar className="text-muted" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Placement Date</h3>
            <p style={{ fontWeight: 600, fontSize: '18px' }}>{order.date}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <CreditCard className="text-muted" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Value</h3>
            <p style={{ fontWeight: 600, fontSize: '18px', color: 'var(--success)' }}>₹{order.total.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="glass">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '18px' }}>Order Items</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th style={{ textAlign: 'right' }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <ChevronRight className="text-muted" size={16} />
                    </div>
                    <span>{item.name}</span>
                  </div>
                </td>
                <td>x{item.quantity}</td>
                <td className="text-muted">₹{item.price.toFixed(2)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{(item.quantity * item.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', padding: '24px' }} className="text-muted">Order Total</td>
              <td style={{ textAlign: 'right', padding: '24px', fontSize: '20px', fontWeight: 'bold' }}>₹{order.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
