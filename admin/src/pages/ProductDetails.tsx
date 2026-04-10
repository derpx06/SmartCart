import { useState, useRef, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData, type Product } from '../contexts/DataContext';
import { ArrowLeft, Save, Image as ImageIcon, Box, Trash2, Upload } from 'lucide-react';

const ModelViewer = 'model-viewer' as any;

const emptyProductForm: Omit<Product, 'id'> = {
  name: '',
  price: 0,
  inventory: 0,
  category: '',
  description: '',
  images: [],
  tags: [],
};

function ProductDetailsForm({
  initialValue,
  isNew,
  productId,
  onSubmit,
}: {
  initialValue: Omit<Product, 'id'> & { model3D?: Product['model3D'] };
  isNew: boolean;
  productId?: string;
  onSubmit: (value: Omit<Product, 'id'>) => Promise<void>;
}) {
  const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialValue);
  const { uploadProductModel3D, deleteProductModel3D } = useData();
  const [model3D, setModel3D] = useState(initialValue.model3D ?? null);
  const [modelUploading, setModelUploading] = useState(false);
  const modelFileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const handleModelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !productId) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      alert('Please upload .glb or .gltf files only.');
      return;
    }

    try {
      setModelUploading(true);
      await uploadProductModel3D(productId, file);
      // After upload, the store refreshes. We need to get the updated product.
      // For now set a placeholder — it will update on next render from store.
      setModel3D({ url: URL.createObjectURL(file), publicId: '', format: ext, size: file.size });
    } catch (error) {
      console.error('Model upload failed:', error);
      alert('Failed to upload 3D model.');
    } finally {
      setModelUploading(false);
      if (modelFileRef.current) modelFileRef.current.value = '';
    }
  };

  const handleModelDelete = async () => {
    if (!productId) return;
    if (!window.confirm('Remove the 3D model from this product?')) return;

    try {
      await deleteProductModel3D(productId);
      setModel3D(null);
    } catch (error) {
      console.error('Model delete failed:', error);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
      <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Image Previews */}
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

        {/* 3D Model Section */}
        {!isNew && productId && (
          <div className="glass-card" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Box size={18} style={{ color: 'var(--accent-base)' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>3D Model</h3>
            </div>

            {model3D?.url ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ 
                  width: '100%', 
                  aspectRatio: '1', 
                  borderRadius: 'var(--radius-md)', 
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.3)',
                }}>
                  <ModelViewer
                    src={model3D.url}
                    alt="3D Model Preview"
                    auto-rotate
                    camera-controls
                    shadow-intensity="1"
                    style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                    loading="lazy"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {model3D.format?.toUpperCase()} {model3D.size ? `• ${formatSize(model3D.size)}` : ''}
                  </span>
                  <button 
                    type="button"
                    onClick={handleModelDelete}
                    className="btn btn-danger"
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                width: '100%',
                aspectRatio: '4/3',
                background: 'rgba(255,255,255,0.03)',
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: modelUploading ? 'wait' : 'pointer',
                transition: 'border-color 0.2s',
              }}
              onClick={() => !modelUploading && modelFileRef.current?.click()}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(109, 64, 255, 0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              >
                {modelUploading ? (
                  <>
                    <div style={{ width: '24px', height: '24px', border: '2px solid var(--accent-base)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={32} style={{ color: 'var(--text-secondary)', opacity: 0.5 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Upload .glb or .gltf</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.6 }}>Click to browse</span>
                  </>
                )}
              </div>
            )}

            <input
              type="file"
              ref={modelFileRef}
              style={{ display: 'none' }}
              accept=".glb,.gltf"
              onChange={handleModelUpload}
            />
          </div>
        )}

        {isNew && (
          <div className="glass-card" style={{ padding: '16px', opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Box size={18} style={{ color: 'var(--text-secondary)' }} />
              <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>3D Model</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Save the product first to upload a 3D model.
            </p>
          </div>
        )}
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
              <select
                required
                className="input-field"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                style={{ appearance: 'none', backgroundColor: 'var(--bg-base)' }}
              >
                <option value="" disabled>Select Category</option>
                <option value="cookware">Cookware</option>
                <option value="bakeware">Bakeware</option>
                <option value="furniture">Furniture</option>
                <option value="kitchen tools">Kitchen Tools</option>
                <option value="dining">Dining</option>
                <option value="decor">Decor</option>
              </select>
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
              <label className="text-muted" style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {(formData.tags || []).map((tag, idx) => (
                  <span key={idx} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {tag}
                    <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== idx) })} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>×</button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                className="input-field"
                placeholder="Add a tag and press Enter..."
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val && !(formData.tags || []).includes(val)) {
                      setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                      e.currentTarget.value = '';
                    }
                  }
                }}
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
          <p className="text-muted">Manage product details, media, and 3D assets.</p>
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
                  tags: existingProduct.tags || [],
                  model3D: existingProduct.model3D,
                }
              : emptyProductForm
          }
          isNew={isNew}
          productId={id}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
