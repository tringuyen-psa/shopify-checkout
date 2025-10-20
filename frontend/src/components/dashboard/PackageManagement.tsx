'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { ShopDashboardAPI, PackageFormData } from '@/lib/api/shop-dashboard';

interface ShopPackage {
  id: string;
  name: string;
  description: string;
  category?: string;
  images?: string[];
  isSubscription: boolean;
  trialDays: number;
  basePrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  features?: string[];
  maxActiveUsers?: number;
  isActive: boolean;
  createdAt: string;
  slug: string;
}

interface PackageManagementProps {
  shopId: string;
  onPackageUpdated: () => void;
}

export function PackageManagement({ shopId, onPackageUpdated }: PackageManagementProps) {
  const [packages, setPackages] = useState<ShopPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<ShopPackage | null>(null);
  const [formData, setFormData] = useState<PackageFormData>({
    name: '',
    description: '',
    isSubscription: false,
    trialDays: 0,
    isActive: true
  });

  useEffect(() => {
    loadPackages();
  }, [shopId]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await ShopDashboardAPI.getShopPackages(shopId);
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    try {
      await ShopDashboardAPI.createShopPackage(shopId, formData);
      setShowCreateModal(false);
      resetForm();
      loadPackages();
      onPackageUpdated();
    } catch (error) {
      console.error('Error creating package:', error);
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      await ShopDashboardAPI.updateShopPackage(shopId, editingPackage.id, formData);
      setEditingPackage(null);
      resetForm();
      loadPackages();
      onPackageUpdated();
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      await ShopDashboardAPI.deleteShopPackage(shopId, packageId);
      loadPackages();
      onPackageUpdated();
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const togglePackageStatus = async (pkg: ShopPackage) => {
    try {
      await ShopDashboardAPI.updateShopPackage(shopId, pkg.id, {
        isActive: !pkg.isActive
      });
      loadPackages();
      onPackageUpdated();
    } catch (error) {
      console.error('Error toggling package status:', error);
    }
  };

  const editPackage = (pkg: ShopPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      category: pkg.category,
      images: pkg.images,
      isSubscription: pkg.isSubscription,
      trialDays: pkg.trialDays,
      basePrice: pkg.basePrice,
      weeklyPrice: pkg.weeklyPrice,
      monthlyPrice: pkg.monthlyPrice,
      yearlyPrice: pkg.yearlyPrice,
      features: pkg.features,
      maxActiveUsers: pkg.maxActiveUsers,
      isActive: pkg.isActive
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      isSubscription: false,
      trialDays: 0,
      isActive: true
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Package Management</h2>
          <p className="text-gray-600">Manage your product packages and subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Package
        </button>
      </div>

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No packages yet</h3>
          <p className="text-gray-600 mb-4">Create your first package to start selling</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Package
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{pkg.name}</h3>
                  <p className="text-sm text-gray-500">{pkg.category}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => togglePackageStatus(pkg)}
                    className={`p-1 rounded ${pkg.isActive ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    {pkg.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => editPackage(pkg)}
                    className="p-1 text-gray-600 hover:text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="p-1 text-gray-600 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>

              <div className="space-y-2 mb-4">
                {pkg.basePrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">One-time:</span>
                    <span className="font-medium">{formatCurrency(pkg.basePrice)}</span>
                  </div>
                )}
                {pkg.monthlyPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly:</span>
                    <span className="font-medium">{formatCurrency(pkg.monthlyPrice)}</span>
                  </div>
                )}
                {pkg.yearlyPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Yearly:</span>
                    <span className="font-medium">{formatCurrency(pkg.yearlyPrice)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  pkg.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </span>
                {pkg.isSubscription && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Subscription
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingPackage) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => {
              setShowCreateModal(false);
              setEditingPackage(null);
              resetForm();
            }} />
            <div className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {editingPackage ? 'Edit Package' : 'Create Package'}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Trial Days
                    </label>
                    <input
                      type="number"
                      value={formData.trialDays}
                      onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isSubscription"
                    checked={formData.isSubscription}
                    onChange={(e) => setFormData({ ...formData, isSubscription: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isSubscription" className="ml-2 block text-sm text-gray-900">
                    This is a subscription package
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.basePrice || ''}
                      onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.monthlyPrice || ''}
                      onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yearly Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.yearlyPrice || ''}
                      onChange={(e) => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) || undefined })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={editingPackage ? handleUpdatePackage : handleCreatePackage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}