import { useState, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, type Product } from '../contexts/DataContext';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';

const emptyProductForm: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  inventory: 0,
  category: '',
  description: '',
  images: [],
};

function ProductDetailsForm({
  initialValue,
  isNew,
  onSubmit,
}: {
  initialValue: Omit<Product, 'id'>;
  isNew: boolean;
  onSubmit: (value: Omit<Product, 'id'>) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialValue);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
        <div className="glass-card" style={{ padding: '12px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>Image Previews</h3>
          {formData.images && formData.images.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {formData.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Preview ${idx + 1}`}
                  style={{ width: '100%', borderRadius: 'var(--radius-md)', aspectRatio: '1', objectFit: 'cover' }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                width: '100%',
                aspectRatio: '1',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                color: 'var(--text-secondary)',
              }}>
              <ImageIcon size={48} opacity={0.5} />
              <span>No images provided</span>
            </div>
          )}
        </div>
      </div>

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
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Category</label>
              <input
                type="text"
                required
                className="input-field"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Inventory</label>
                <input
                  type="number"
                  required
                  className="input-field"
                  value={formData.inventory}
                  onChange={e => setFormData({ ...formData, inventory: parseInt(e.target.value, 10) })}
                />
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Description</label>
              <textarea
                className="input-field"
                style={{ minHeight: '100px', resize: 'vertical' }}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Image URLs</label>
              {(formData.images || []).map((url, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="input-field"
                    style={{ flex: 1 }}
                    value={url}
                    onChange={e => {
                      const newImages = [...(formData.images || [])];
                      newImages[idx] = e.target.value;
                      setFormData({ ...formData, images: newImages });
                    }}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => {
                      const newImages = [...(formData.images || [])];
                      newImages.splice(idx, 1);
                      setFormData({ ...formData, images: newImages });
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                className="btn btn-outline" 
                onClick={() => setFormData({ ...formData, images: [...(formData.images || []), ''] })}
                style={{ marginTop: '8px' }}
              >
                + Add Image
              </button>
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
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addProduct, updateProduct, isLoading } = useData();
  
  const isNew = !id || id === 'new';
  const existingProduct = products.find(p => p.id === id);

  const handleSubmit = async (formData: Omit<Product, 'id'>) => {
    if (isNew) {
      await addProduct(formData);
    } else if (id) {
      await updateProduct(id, formData);
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

      {!isNew && isLoading && !existingProduct ? (
        <div className="glass-card">Loading product...</div>
      ) : (
        <ProductDetailsForm
          key={existingProduct?.id ?? 'new-product'}
          initialValue={
            existingProduct
              ? {
                  name: existingProduct.name,
                  price: existingProduct.price,
                  inventory: existingProduct.inventory,
                  category: existingProduct.category,
                  description: existingProduct.description,
                  images: existingProduct.images || [],
                }
              : emptyProductForm
          }
          isNew={isNew}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
