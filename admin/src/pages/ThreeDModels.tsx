import { useState, useRef } from 'react';
import { useAdminDataStore } from '../store/data-store';
import { adminApi } from '../lib/api';
import { 
  Box, 
  Trash2, 
  Search, 
  Plus, 
  FileBox, 
  MoreVertical,
} from 'lucide-react';

const ModelViewer = 'model-viewer' as any;

export default function ThreeDModels() {
  const { models3D, isLoading, removeModel3D, refreshData } = useAdminDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredModels = models3D.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'glb' && ext !== 'gltf') {
      alert('Please upload .glb or .gltf files only.');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('model', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, "")); // Remove extension for display name

      await adminApi.uploadModel3D(formData);
      await refreshData();
      alert('Model uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the model "${name}"?`)) {
      try {
        await removeModel3D(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col gap-10">
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '24px',
        flexWrap: 'wrap' 
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <h1 className="text-3xl font-bold tracking-tight">3D Assets</h1>
          <p className="text-muted" style={{ fontSize: '15px', marginTop: '6px' }}>
            Manage and inspect interactive 3D models for your products.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-primary"
            style={{ padding: '12px 32px', height: '48px', whiteSpace: 'nowrap' }}
          >
            {uploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Upload New Asset
              </>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".glb,.gltf"
            onChange={handleFileUpload}
          />
        </div>
      </header>

      {/* Header Actions */}
      <div className="glass" style={{ padding: '16px' }}>
        <div className="products-search-field">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search assets by name..."
            className="input-field products-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && models3D.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed glass">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Box className="h-10 w-10 animate-pulse" />
            <p>Loading models...</p>
          </div>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed glass">
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <div className="rounded-full bg-muted p-4">
              <FileBox className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No 3D models found</h3>
              <p className="text-muted-foreground max-w-sm">
                Connect your products with interactive 3D experiences. Start by uploading your first model.
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-outline"
            >
              Upload your first model
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model) => (
            <div key={model._id} className="glass-card overflow-hidden group">
              <div className="relative aspect-square w-full bg-black/20 overflow-hidden">
                {/* 3D Preview Component */}
                <ModelViewer
                  src={model.url}
                  alt={model.name}
                  auto-rotate
                  camera-controls
                  shadow-intensity="1"
                  style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                  loading="lazy"
                  ar-modes="webxr scene-viewer quick-look"
                ></ModelViewer>
                
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={() => handleDelete(model._id, model.name)}
                    className="p-2 bg-red-500/80 hover:bg-red-600 rounded-md text-white shadow-lg backdrop-blur-sm"
                   >
                     <Trash2 size={16} />
                   </button>
                </div>

                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] uppercase font-bold text-white/70">
                  {model.format}
                </div>
              </div>

              <div className="p-4 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate pr-2" title={model.name}>
                    {model.name}
                  </h3>
                  <MoreVertical className="h-4 w-4 text-muted-foreground cursor-pointer" />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatSize(model.size)}</span>
                  <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
