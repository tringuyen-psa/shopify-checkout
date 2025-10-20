'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, CreditCard, Globe, Moon, Sun } from 'lucide-react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  timezone: string;
  language: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  purchaseNotifications: boolean;
  subscriptionNotifications: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  purchaseHistoryVisibility: boolean;
  subscriptionListVisibility: boolean;
  dataSharing: boolean;
}

export default function CustomerSettings() {
  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'privacy' | 'billing' | 'security'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    country: 'US',
    timezone: 'America/New_York',
    language: 'en'
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    purchaseNotifications: true,
    subscriptionNotifications: true,
    marketingEmails: false,
    securityAlerts: true
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'private',
    purchaseHistoryVisibility: false,
    subscriptionListVisibility: false,
    dataSharing: false
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Profile updated successfully!');
    }, 1000);
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Notification settings updated!');
    }, 1000);
  };

  const handleSavePrivacy = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Privacy settings updated!');
    }, 1000);
  };

  const navigationItems = [
    { id: 'profile', label: 'Profile Information', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'billing', label: 'Payment Methods', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-500">Manage your account preferences and security</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <a
                href="/dashboard/customer"
                className="text-gray-500 hover:text-gray-700"
              >
                Back to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Profile Information */}
            {activeSection === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Update your personal information and contact details</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <select
                        value={profile.country}
                        onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                        <option value="SG">Singapore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <select
                        value={profile.timezone}
                        onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Australia/Sydney">Sydney (AEST)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select
                        value={profile.language}
                        onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        defaultValue="USD"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                        <option value="AUD">AUD - Australian Dollar</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose how you want to be notified about your account activity</p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive email notifications about your account</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, emailNotifications: !notifications.emailNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Purchase Notifications</h3>
                        <p className="text-sm text-gray-500">Get notified when you make a purchase</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, purchaseNotifications: !notifications.purchaseNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.purchaseNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.purchaseNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Subscription Notifications</h3>
                        <p className="text-sm text-gray-500">Receive alerts about subscription renewals and changes</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, subscriptionNotifications: !notifications.subscriptionNotifications })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.subscriptionNotifications ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.subscriptionNotifications ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Marketing Emails</h3>
                        <p className="text-sm text-gray-500">Receive promotional offers and product updates</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, marketingEmails: !notifications.marketingEmails })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.marketingEmails ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Security Alerts</h3>
                        <p className="text-sm text-gray-500">Get notified about important security events</p>
                      </div>
                      <button
                        onClick={() => setNotifications({ ...notifications, securityAlerts: !notifications.securityAlerts })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          notifications.securityAlerts ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            notifications.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveNotifications}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy & Security */}
            {activeSection === 'privacy' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
                  <p className="text-sm text-gray-500 mt-1">Control your privacy settings and security preferences</p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            checked={privacy.profileVisibility === 'public'}
                            onChange={() => setPrivacy({ ...privacy, profileVisibility: 'public' })}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">Public</p>
                            <p className="text-sm text-gray-500">Anyone can view your profile</p>
                          </div>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="profileVisibility"
                            checked={privacy.profileVisibility === 'private'}
                            onChange={() => setPrivacy({ ...privacy, profileVisibility: 'private' })}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-gray-900">Private</p>
                            <p className="text-sm text-gray-500">Only you can view your profile</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">Data Sharing</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Purchase History Visibility</p>
                            <p className="text-sm text-gray-500">Allow shops to see your purchase history</p>
                          </div>
                          <button
                            onClick={() => setPrivacy({ ...privacy, purchaseHistoryVisibility: !privacy.purchaseHistoryVisibility })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacy.purchaseHistoryVisibility ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacy.purchaseHistoryVisibility ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Subscription List Visibility</p>
                            <p className="text-sm text-gray-500">Allow shops to see your active subscriptions</p>
                          </div>
                          <button
                            onClick={() => setPrivacy({ ...privacy, subscriptionListVisibility: !privacy.subscriptionListVisibility })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacy.subscriptionListVisibility ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacy.subscriptionListVisibility ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Data Sharing with Partners</p>
                            <p className="text-sm text-gray-500">Share anonymous usage data to improve our services</p>
                          </div>
                          <button
                            onClick={() => setPrivacy({ ...privacy, dataSharing: !privacy.dataSharing })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              privacy.dataSharing ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                privacy.dataSharing ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">Danger Zone</h3>
                      <div className="space-y-3">
                        <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50">
                          Download My Data
                        </button>
                        <button className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 ml-3">
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSavePrivacy}
                      disabled={isLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {activeSection === 'billing' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your payment methods and billing information</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">VISA</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">•••• 4242</p>
                            <p className="text-sm text-gray-500">Expires 12/24</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Default</span>
                          <button className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                          <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
                        </div>
                      </div>
                    </div>
                    <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700">
                      + Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage your account security and authentication</p>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Password</h3>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Change Password
                      </button>
                    </div>
                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">2FA Status</p>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                    <div className="border-t pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Chrome on macOS</p>
                            <p className="text-sm text-gray-500">Last active: 2 hours ago</p>
                          </div>
                          <button className="text-sm text-red-600 hover:text-red-700">Sign Out</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">Safari on iPhone</p>
                            <p className="text-sm text-gray-500">Last active: 1 day ago</p>
                          </div>
                          <button className="text-sm text-red-600 hover:text-red-700">Sign Out</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}