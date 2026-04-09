import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

export default function Products() {
  const { products, removeProduct } = useData();
  const navigate = useNavigate();

  const handleRemove = async (id: string) => {
    await removeProduct(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ color: 'white' }}>Product Catalog</h1>
          <p className="text-muted" style={{ marginTop: '4px' }}>Manage items, descriptions, and media.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Inventory</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px' }} className="text-muted">No products found.</td></tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '8px', 
                        overflow: 'hidden', 
                        background: 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Package className="text-muted" size={20} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500, color: 'white' }}>{p.name}</span>
                        <span className="text-muted" style={{ fontSize: '12px' }}>
                          {p.description.length > 50 ? p.description.substring(0, 50) + '...' : p.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">{p.category}</td>
                  <td style={{ fontWeight: 600 }}>₹{p.price.toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '12px',
                      fontSize: '12px',
                      background: p.inventory > 10 ? 'rgba(0, 210, 133, 0.1)' : 'rgba(255, 74, 90, 0.1)',
                      color: p.inventory > 10 ? 'var(--success)' : 'var(--danger)'
                    }}>
                      {p.inventory} in stock
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ padding: '6px', marginRight: '8px' }} onClick={() => navigate(`/products/${p.id}`)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => void handleRemove(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
