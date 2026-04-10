import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Plus, Edit2, Trash2, Package, Search, Boxes, Layers3, AlertTriangle } from 'lucide-react';

const LOW_STOCK_THRESHOLD = 10;

const formatCurrency = (amount: number) =>
  amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Products() {
  const { products, removeProduct } = useData();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      products.map((product) => product.category.trim()).filter(Boolean)
    );
    return ['All', ...Array.from(uniqueCategories)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return products.filter((product) => {
      const inCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesQuery =
        query.length === 0 ||
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);

      return inCategory && matchesQuery;
    });
  }, [products, searchQuery, selectedCategory]);

  const totalInventory = useMemo(
    () => products.reduce((sum, product) => sum + product.inventory, 0),
    [products]
  );

  const lowStockProducts = useMemo(
    () => products.filter((product) => product.inventory > 0 && product.inventory <= LOW_STOCK_THRESHOLD),
    [products]
  );

  const estimatedCatalogValue = useMemo(
    () => products.reduce((sum, product) => sum + product.price * product.inventory, 0),
    [products]
  );

  const getStockTone = (inventory: number) => {
    if (inventory <= 0) {
      return { label: 'Out of stock', tone: 'critical' as const };
    }

    if (inventory <= LOW_STOCK_THRESHOLD) {
      return { label: `${inventory} left`, tone: 'warning' as const };
    }

    return { label: `${inventory} in stock`, tone: 'healthy' as const };
  };

  const handleRemove = async (id: string) => {
    await removeProduct(id);
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="products-title-wrap">
          <span className="products-title-icon">
            <Package size={20} />
          </span>
          <div>
            <h1 style={{ color: 'white' }}>Product Catalog</h1>
            <p className="text-muted" style={{ marginTop: '4px' }}>
              Manage items, pricing, and stock levels across categories.
            </p>
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => navigate('/products/new')}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="products-metrics-grid">
        <div className="glass-card products-metric-card">
          <div className="products-metric-label">
            <Boxes size={16} />
            Total Products
          </div>
          <div className="products-metric-value">{products.length}</div>
        </div>

        <div className="glass-card products-metric-card">
          <div className="products-metric-label">
            <Layers3 size={16} />
            Categories
          </div>
          <div className="products-metric-value">{categories.length - 1}</div>
        </div>

        <div className="glass-card products-metric-card">
          <div className="products-metric-label">
            <AlertTriangle size={16} />
            Low Stock
          </div>
          <div className="products-metric-value">{lowStockProducts.length}</div>
        </div>

        <div className="glass-card products-metric-card">
          <div className="products-metric-label">Inventory Units</div>
          <div className="products-metric-value">{totalInventory}</div>
          <p className="text-muted products-metric-subtext">
            Value: {'\u20B9'}
            {formatCurrency(estimatedCatalogValue)}
          </p>
        </div>
      </div>

      <div className="glass products-controls">
        <label className="products-search-field">
          <Search size={16} />
          <input
            type="text"
            className="input-field products-search-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, category, or description"
          />
        </label>

        <div className="products-category-chips">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={selectedCategory === category ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="glass products-table-shell">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="products-empty-state">
                  <Package size={28} />
                  <p className="text-muted">
                    {products.length === 0
                      ? 'No products found. Add your first product to get started.'
                      : 'No products match your current filters.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const stock = getStockTone(product.inventory);

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="products-item-cell">
                        <div className="products-item-thumb">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Package className="text-muted" size={20} />
                          )}
                        </div>

                        <div className="products-item-meta">
                          <span className="products-item-title">{product.name}</span>
                          <span className="text-muted products-item-description">
                            {product.description.length > 56
                              ? `${product.description.substring(0, 56)}...`
                              : product.description}
                          </span>
                          <span className="text-muted products-item-id">ID: {product.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="products-category-pill">{product.category}</span>
                    </td>
                    <td className="products-price-cell">
                      {'\u20B9'}
                      {formatCurrency(product.price)}
                    </td>
                    <td>
                      <span className={`products-stock-badge products-stock-${stock.tone}`}>
                        {stock.label}
                      </span>
                    </td>
                    <td className="products-actions-cell">
                      <button
                        className="btn btn-outline products-icon-button"
                        onClick={() => navigate(`/products/${product.id}`)}
                        title={`Edit ${product.name}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn btn-danger products-icon-button"
                        onClick={() => void handleRemove(product.id)}
                        title={`Delete ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-muted products-footnote">
        Showing {filteredProducts.length} of {products.length} products.
      </p>
    </div>
  );
}