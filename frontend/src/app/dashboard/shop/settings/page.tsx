'use client';

import { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

interface ShopSettings {
  name: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  banner: string;
  platformFeePercent: number;
  stripeAccountId?: string;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
}

export default function ShopSettingsPage() {
  const [settings, setSettings] = useState<ShopSettings>({
    name: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    logo: '',
    banner: '',
    platformFeePercent: 15,
    stripeOnboardingComplete: false,
    stripeChargesEnabled: false,
    stripePayoutsEnabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Mock shop ID - in real app, get from auth context
  const shopId = 'user-shop-id';

  useEffect(() => {
    loadSettings();
  }, [shopId]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API
      // const data = await ShopAPI.getSettings(shopId);
      // setSettings(data);

      // Mock data for now
      setSettings({
        name: 'My Digital Shop',
        description: 'We sell amazing digital products',
        email: 'shop@example.com',
        phone: '+1 (555) 123-4567',
        website: 'https://myshop.com',
        logo: '',
        banner: '',
        platformFeePercent: 15,
        stripeOnboardingComplete: false,
        stripeChargesEnabled: false,
        stripePayoutsEnabled: false
      });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // In real app, save to API
      // await ShopAPI.updateSettings(shopId, settings);

      // Mock save
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({ type: 'success', text: 'Settings saved successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleStripeOnboarding = async () => {
    try {
      // In real app, create Stripe Connect onboarding link
      // const { url } = await ShopAPI.createStripeOnboardingLink(shopId);
      // window.location.href = url;

      setMessage({ type: 'error', text: 'Stripe onboarding not available in demo' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to start Stripe onboarding' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white shadow-sm">
          <DashboardNav shopId={shopId} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <DashboardNav shopId={shopId} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Shop Settings</h1>
            <p className="text-gray-600">Manage your shop information and payment settings</p>
          </div>

          {/* Success/Error Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
            </div>
          )}

          {/* Shop Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Shop Information</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={settings.website}
                    onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://yourshop.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Connect Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Processing (Stripe Connect)</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Onboarding Status</h3>
                  <p className="text-sm text-gray-600">
                    {settings.stripeOnboardingComplete
                      ? 'Your Stripe account is fully set up'
                      : 'Complete Stripe Connect onboarding to receive payments'
                    }
                  </p>
                </div>
                <div className="flex items-center">
                  {settings.stripeOnboardingComplete ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Complete
                    </span>
                  ) : (
                    <button
                      onClick={handleStripeOnboarding}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Complete Setup
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    settings.stripeChargesEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700">Charges Enabled</span>
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    settings.stripePayoutsEnabled ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm text-gray-700">Payouts Enabled</span>
                </div>
              </div>

              {settings.stripeAccountId && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Stripe Account ID:</strong> {settings.stripeAccountId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Platform Fee */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform Fee</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Fee Percentage
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={settings.platformFeePercent}
                    onChange={(e) => setSettings({ ...settings, platformFeePercent: parseFloat(e.target.value) || 0 })}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="30"
                    step="0.1"
                  />
                  <span className="ml-2 text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This percentage will be deducted from each sale as platform fee
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}