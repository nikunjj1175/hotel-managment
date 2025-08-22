import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../store';
import { RequireRole } from '../../components/RequireRole';
import Layout from '../../components/Layout';
import ImageUpload from '../../components/ImageUpload';

interface MenuItem { 
  _id: string; 
  name: string; 
  price: number; 
  category?: string; 
  isAvailable: boolean;
  imageUrl?: string;
  cloudinaryPublicId?: string;
  description?: string;
}
 
export default function AdminMenuPage() {
  const { token, hydrated } = useAppSelector(s => s.auth);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    name: '', 
    price: 0, 
    category: '', 
    description: '',
    isAvailable: true,
    imageUrl: '',
    cloudinaryPublicId: ''
  });

  useEffect(() => {
    if (hydrated && token) {
      // Set the authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      load();
    }
  }, [hydrated, token]);

  const load = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`/api/menu`);
      setItems(res.data);
    } catch (err: any) {
      console.error('Error loading menu items:', err);
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to load menu items');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string, cloudinaryPublicId?: string) => {
    setForm(prev => ({ ...prev, imageUrl, cloudinaryPublicId: cloudinaryPublicId || '' }));
  };

  const handleImageRemove = () => {
    setForm(prev => ({ ...prev, imageUrl: '', cloudinaryPublicId: '' }));
  };

  const createItem = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    if (!form.name || form.price <= 0) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await axios.post(`/api/menu`, form);
      toast.success('Item created successfully');
      setForm({ name: '', price: 0, category: '', description: '', isAvailable: true, imageUrl: '', cloudinaryPublicId: '' });
      load();
    } catch (err: any) {
      console.error('Error creating menu item:', err);
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to create menu item');
      }
    }
  };

  const updateItem = async (id: string, payload: Partial<MenuItem>) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      await axios.put(`/api/menu/${id}`, payload);
      toast.success('Item updated successfully');
      load();
    } catch (err: any) {
      console.error('Error updating menu item:', err);
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to update menu item');
      }
    }
  };

  const removeItem = async (id: string) => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      await axios.delete(`/api/menu/${id}`);
      toast.success('Item deleted successfully');
      load();
    } catch (err: any) {
      console.error('Error deleting menu item:', err);
      if (err.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to delete menu item');
      }
    }
  };

  // Don't render until auth is hydrated
  if (!hydrated) {
    return (
      <Layout title="Manage Menu">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Show error if no token
  if (!token) {
    return (
      <Layout title="Manage Menu">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">🔒 Authentication Required</div>
            <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
            <a href="/login" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Go to Login
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <RequireRole allow={["ADMIN","SUPER_ADMIN"] as any}>
      <Layout title="Manage Menu">
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">➕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Create New Menu Item</h3>
            </div>
            
            <div className="grid gap-6">
              {/* Image Upload Section */}
              <ImageUpload
                onImageUpload={handleImageUpload}
                currentImageUrl={form.imageUrl}
                currentCloudinaryPublicId={form.cloudinaryPublicId}
                onImageRemove={handleImageRemove}
                menuName={form.name}
              />

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    placeholder="e.g., Margherita Pizza" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={form.price || ''} 
                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <input 
                    placeholder="e.g., Pizza, Beverage, Dessert" 
                    value={form.category} 
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-medium text-gray-700">Availability</label>
                  <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg">
                    <input 
                      type="checkbox" 
                      checked={form.isAvailable} 
                      onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    /> 
                    <span className="text-sm text-gray-700">Available for ordering</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  placeholder="Describe the item, ingredients, or special features..." 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={createItem}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Menu Item'}
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Menu Items ({items.length})</h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  {items.filter(item => item.isAvailable).length} available
                </div>
                <button 
                  onClick={load} 
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center min-h-[200px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading menu items...</p>
                </div>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No menu items yet</h4>
                <p className="text-gray-500">Create your first menu item using the form above</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map(mi => (
                  <div key={mi._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {mi.imageUrl ? (
                      <div className="relative h-48 bg-gray-100">
                        <img 
                          src={mi.imageUrl} 
                          alt={mi.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            mi.isAvailable 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {mi.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-sm">No image</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg leading-tight">{mi.name}</h4>
                        <span className="font-bold text-lg text-green-600">₹{mi.price}</span>
                      </div>
                      
                      {mi.category && (
                        <div className="text-sm text-blue-600 font-medium mb-2">{mi.category}</div>
                      )}
                      
                      {mi.description && (
                        <div className="text-sm text-gray-600 mb-4 line-clamp-2">{mi.description}</div>
                      )}
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => updateItem(mi._id, { isAvailable: !mi.isAvailable })}
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            mi.isAvailable 
                              ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200' 
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                          }`}
                        >
                          {mi.isAvailable ? 'Mark Unavailable' : 'Mark Available'}
                        </button>
                        <button 
                          onClick={() => removeItem(mi._id)} 
                          className="px-3 py-2 text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-md transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </RequireRole>
  );
}


