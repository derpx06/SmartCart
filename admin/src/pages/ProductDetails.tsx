import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, type Product } from '../contexts/DataContext';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct } = useData();
  
  const isNew = !id || id === 'new';
  const existingProduct = products.find(p => p.id === id);

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    price: 0,
    inventory: 0,
    category: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        price: existingProduct.price,
        inventory: existingProduct.inventory,
        category: existingProduct.category,
        description: existingProduct.description,
        imageUrl: existingProduct.imageUrl
      });
    }
  }, [existingProduct]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isNew) {
      addProduct(formData);
    } else if (id) {
      updateProduct(id, formData);
    }
    navigate('/products');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button onClick={() => navigate('/products')} className="btn btn-outline" style={{ padding: '8px' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ color: 'white' }}>{isNew ? 'New Product' : 'Edit Product'}</h1>
          <p className="text-muted">Manage product details and media.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        {/* Preview Area */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
           <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
             <h3 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Image Preview</h3>
             {formData.imageUrl ? (
               <img 
                src={formData.imageUrl} 
                alt="Preview" 
                style={{ width: '100%', borderRadius: 'var(--radius-md)', aspectRatio: '1', objectFit: 'cover' }} 
               />
             ) : (
               <div style={{ 
                 width: '100%', 
                 aspectRatio: '1', 
                 background: 'rgba(255,255,255,0.05)', 
                 borderRadius: 'var(--radius-md)',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 gap: '12px',
                 color: 'var(--text-secondary)'
               }}>
                 <ImageIcon size={48} opacity={0.5} />
                 <span>No image URL provided</span>
               </div>
             )}
           </div>
        </div>

        {/* Form Area */}
        <div style={{ flex: '2 1 500px' }}>
          <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Product Name</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Category</label>
                <input 
                  type="text" 
                  required 
                  className="input-field" 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Price (₹)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    className="input-field" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Inventory</label>
                  <input 
                    type="number" 
                    required 
                    className="input-field" 
                    value={formData.inventory} 
                    onChange={e => setFormData({...formData, inventory: parseInt(e.target.value)})} 
                  />
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Description</label>
                <textarea 
                  className="input-field" 
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Image URL</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>
                <Save size={18} /> {isNew ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
