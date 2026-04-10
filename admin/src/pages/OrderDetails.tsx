import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, type Order, type OrderItem } from '../contexts/DataContext';
import { ArrowLeft, User, Calendar, CreditCard, ChevronRight, Save, Trash2, Plus } from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, updateOrder } = useData();
  
  const existingOrder = orders.find(o => o.id === id);

  const [formData, setFormData] = useState<Order | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  useEffect(() => {
    if (existingOrder && !formData) {
      setFormData(existingOrder);
    }
  }, [existingOrder, formData]);

  if (!existingOrder || !formData) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: 'white' }}>Order Not Found</h2>
        <button onClick={() => navigate('/orders')} className="btn btn-outline" style={{ marginTop: '20px' }}>
          Back to Orders
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateOrder(formData.id, {
      status: formData.status,
      total: formData.total,
      items: formData.items,
    });
    navigate('/orders');
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Ordered': return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' };
      case 'On the way': return { bg: 'rgba(109, 64, 255, 0.1)', color: 'var(--accent-base)' };
      case 'Delivered': return { bg: 'rgba(0, 210, 133, 0.1)', color: 'var(--success)' };
      case 'Failed': return { bg: 'rgba(255, 74, 90, 0.1)', color: 'var(--danger)' };
      default: return { bg: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)' };
    }
  };

  const scheme = getStatusColor(formData.status);

  const handleItemChange = (idx: number, key: keyof OrderItem, value: any) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [key]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (idx: number) => {
    const newItems = [...formData.items];
    newItems.splice(idx, 1);
    setFormData({ ...formData, items: newItems });
  };

  const addPlaceholderItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { productId: '', name: 'New Custom Item', quantity: 1, price: 0 }
      ]
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button type="button" onClick={() => navigate('/orders')} className="btn btn-outline" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ color: 'white' }}>Edit Order</h1>
            <p className="text-muted">ID: {formData.id}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative' }}>
            <button 
              type="button" 
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              style={{
                backgroundColor: scheme.bg,
                color: scheme.color,
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: scheme.color }}></div>
              {formData.status} 
              <ChevronRight size={16} style={{ transform: isStatusDropdownOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {isStatusDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                zIndex: 10,
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                minWidth: '160px'
              }}>
                {(['Ordered', 'On the way', 'Delivered', 'Failed'] as const).map(option => {
                  const optScheme = getStatusColor(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, status: option });
                        setIsStatusDropdownOpen(false);
                      }}
                      style={{
                        padding: '10px 16px',
                        background: formData.status === option ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        color: optScheme.color,
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = formData.status === option ? 'rgba(255,255,255,0.05)' : 'transparent'}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: optScheme.color }}></div>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', gap: '8px' }}>
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Customer & Info Cards */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <User className="text-muted" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Customer</h3>
            <p style={{ fontWeight: 600, fontSize: '18px' }}>{formData.customerName}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <Calendar className="text-muted" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Placement Date</h3>
            <p style={{ fontWeight: 600, fontSize: '18px' }}>{formData.date}</p>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <CreditCard className="text-muted" />
          </div>
          <div>
            <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Value</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '18px', color: 'var(--success)' }}>$</span>
              <input 
                type="number" 
                className="input-field" 
                value={formData.total}
                onChange={e => setFormData({ ...formData, total: parseFloat(e.target.value) || 0 })}
                style={{ width: '120px', padding: '4px 8px', fontSize: '16px' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass">
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px' }}>Order Items</h2>
          <button type="button" onClick={addPlaceholderItem} className="btn btn-outline" style={{ padding: '8px 16px', gap: '8px', fontSize: '13px' }}>
            <Plus size={16} /> Add Item
          </button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '16px 24px' }}>Product</th>
              <th style={{ padding: '16px 24px' }}>Quantity</th>
              <th style={{ padding: '16px 24px' }}>Unit Price ($)</th>
              <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ minWidth: '32px', height: '32px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <ChevronRight className="text-muted" size={14} />
                    </div>
                    <input
                      type="text"
                      className="input-field"
                      style={{ padding: '6px', minWidth: '150px', flex: 1 }}
                      value={item.name}
                      onChange={e => handleItemChange(idx, 'name', e.target.value)}
                      placeholder="Product Name"
                    />
                  </div>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <input
                    type="number"
                    className="input-field"
                    style={{ width: '80px', padding: '6px' }}
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <input
                    type="number"
                    className="input-field"
                    style={{ width: '100px', padding: '6px' }}
                    value={item.price}
                    onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '6px' }} onClick={() => removeItem(idx)}>
                    <Trash2 size={16} className="text-muted" />
                  </button>
                </td>
              </tr>
            ))}
            {formData.items.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }} className="text-muted">
                  No items in this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </form>
  );
}
