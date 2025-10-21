'use client';

import React, { useState } from 'react';
import { usePackages } from '@/hooks/usePackages';
import { PackageCard } from '@/components/PackageCard';
import { PackageModal } from '@/components/PackageModal';
import { Button } from '@/components/ui/Button';
import { Package, BillingCycle } from '@/types/package';
import { ShoppingCart, Package as PackageIcon, Star, Zap, User, Store, Settings, CreditCard, Users, TrendingUp, LogIn } from 'lucide-react';

export default function Home() {
    const {
        packages,
        loading,
        error,
        refetch,
        seedPackages,
    } = usePackages();

    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSeeding, setIsSeeding] = useState(false);

    const handleViewDetails = (pkg: Package) => {
        setSelectedPackage(pkg);
        setIsModalOpen(true);
    };

    const handleSelectPackage = async (pkg: Package, billingCycle: BillingCycle) => {
        // Navigate to checkout page with package details
        const checkoutUrl = `/checkout?packageId=${pkg.id}&billingCycle=${billingCycle}`;
        window.location.href = checkoutUrl;

        setIsModalOpen(false);
    };

    const handleSeedPackages = async () => {
        setIsSeeding(true);
        try {
            await seedPackages();
            await refetch();
        } catch (error) {
            console.error('Error seeding packages:', error);
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <PackageIcon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Shopify Checkout</h1>
                                <p className="text-sm text-gray-500">Multi-Vendor Digital Marketplace</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {/* Auth Links */}
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/login'}
                                className="flex items-center space-x-2"
                            >
                                <LogIn className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign In</span>
                            </Button>

                            <Button
                                onClick={() => window.location.href = '/register'}
                                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">Sign Up</span>
                            </Button>

                            {/* Customer Links */}
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/my-purchases'}
                                className="flex items-center space-x-2"
                            >
                                <User className="h-4 w-4" />
                                <span className="hidden sm:inline">My Purchases</span>
                            </Button>

                            <div className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                                <ShoppingCart className="h-4 w-4" />
                                <span className="hidden sm:inline">Cart (0)</span>
                            </div>

                            {/* Shop Owner Links */}
                            <div className="flex items-center space-x-2 border-l pl-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.href = '/dashboard/shop'}
                                    className="flex items-center space-x-1"
                                >
                                    <Store className="h-4 w-4" />
                                    <span className="hidden md:inline">Shop Dashboard</span>
                                </Button>
                            </div>

                            {/* Admin Links */}
                            <div className="flex items-center space-x-2 border-l pl-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.location.href = '/dashboard/admin'}
                                    className="flex items-center space-x-1"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden lg:inline">Admin Panel</span>
                                </Button>
                            </div>

                            {/* Demo Actions */}
                            <div className="flex items-center space-x-2 border-l pl-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSeedPackages}
                                    loading={isSeeding}
                                    disabled={packages.length > 0}
                                    className="flex items-center space-x-1"
                                >
                                    <Zap className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        {packages.length > 0 ? 'Data Loaded' : 'Load Demo Data'}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            MULTI-VENDOR PLATFORM
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Shopify Checkout
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                        Complete multi-vendor digital marketplace with Stripe Connect integration. Manage shops, process payments, and track analytics all in one platform.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <div className="flex items-center">
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <Star className="h-5 w-5 text-yellow-400 fill-current" />
                            <span className="ml-2">4.9/5 from 2,847 reviews</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Access Cards */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Access</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Navigate to different sections of the platform based on your role
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Customer Card */}
                        <div className="bg-blue-50 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-blue-200">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                                    <User className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Customer Portal</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Browse packages, manage purchases, and track subscriptions</p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => window.location.href = '/my-purchases'}
                                    className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    → My Purchases
                                </button>
                                <button
                                    onClick={() => window.location.href = '/checkout'}
                                    className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    → Checkout Demo
                                </button>
                            </div>
                        </div>

                        {/* Shop Owner Card */}
                        <div className="bg-green-50 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-green-200">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                                    <Store className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Shop Dashboard</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Manage your shop, products, and track sales analytics</p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => window.location.href = '/dashboard/shop'}
                                    className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    → Shop Dashboard
                                </button>
                                <button
                                    onClick={() => window.location.href = '/dashboard/shop/payouts'}
                                    className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    → View Payouts
                                </button>
                                <button
                                    onClick={() => window.location.href = '/dashboard/shop/settings'}
                                    className="w-full text-left px-3 py-2 text-sm text-green-700 hover:bg-green-100 rounded-lg transition-colors"
                                >
                                    → Settings
                                </button>
                            </div>
                        </div>

                        {/* Admin Card */}
                        <div className="bg-purple-50 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-purple-200">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                                    <Settings className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Admin Panel</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Platform administration and user management</p>
                            <div className="space-y-2">
                                <button
                                    onClick={() => window.location.href = '/dashboard/admin'}
                                    className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                >
                                    → Admin Dashboard
                                </button>
                                <button
                                    className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                >
                                    → User Management
                                </button>
                                <button
                                    className="w-full text-left px-3 py-2 text-sm text-purple-700 hover:bg-purple-100 rounded-lg transition-colors"
                                >
                                    → Analytics
                                </button>
                            </div>
                        </div>

                        {/* Demo Card */}
                        <div className="bg-orange-50 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer border border-orange-200">
                            <div className="flex items-center mb-4">
                                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mr-4">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Demo Actions</h3>
                            </div>
                            <p className="text-gray-600 mb-4">Load demo data and test platform features</p>
                            <div className="space-y-2">
                                <button
                                    onClick={handleSeedPackages}
                                    disabled={isSeeding || packages.length > 0}
                                    className="w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {isSeeding ? '⏳ Loading...' : packages.length > 0 ? '✅ Data Loaded' : '→ Load Demo Data'}
                                </button>
                                <button
                                    className="w-full text-left px-3 py-2 text-sm text-orange-700 hover:bg-orange-100 rounded-lg transition-colors"
                                >
                                    → View Documentation
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Complete e-commerce solution with multi-vendor support and advanced analytics
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Multi-Vendor Support</h3>
                            <p className="text-gray-600">Multiple shops can sell products with individual Stripe Connect accounts</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CreditCard className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Stripe Connect</h3>
                            <p className="text-gray-600">Secure payment processing with direct payouts to vendors</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                            <p className="text-gray-600">Real-time sales tracking and comprehensive reporting</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <PackageIcon className="h-8 w-8 text-yellow-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Subscription Management</h3>
                            <p className="text-gray-600">Recurring billing with flexible subscription plans</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="h-8 w-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">User Management</h3>
                            <p className="text-gray-600">Role-based access control and customer management</p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Settings className="h-8 w-8 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Configuration</h3>
                            <p className="text-gray-600">Simple setup with comprehensive admin controls</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        <p className="mt-4 text-gray-600">Loading packages...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Packages</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <Button onClick={refetch}>Try Again</Button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && packages.length === 0 && (
                    <div className="text-center py-16">
                        <PackageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Packages Available</h3>
                        <p className="text-gray-600 mb-6">Get started by loading some sample packages to see how everything works.</p>
                        <Button onClick={handleSeedPackages} loading={isSeeding}>
                            Load Sample Packages
                        </Button>
                    </div>
                )}

                {/* Packages Grid */}
                {!loading && !error && packages.length > 0 && (
                    <>
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h3>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Select the perfect package for your needs. All plans include our core features with varying levels of support and advanced capabilities.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {packages.map((pkg) => (
                                <PackageCard
                                    key={pkg.id}
                                    pkg={pkg}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div>
                            <div className="flex items-center mb-4">
                                <PackageIcon className="h-8 w-8 text-blue-400 mr-3" />
                                <h3 className="text-xl font-bold">Shopify Checkout</h3>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Complete multi-vendor digital marketplace platform with Stripe Connect integration.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-5.373 12-12 12-5.627 5.373-12 12-12 5.373-12 12-12 0 5.516 4.534 10.5 12.073z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button
                                        onClick={() => window.location.href = '/my-purchases'}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        Customer Dashboard
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => window.location.href = '/dashboard/shop'}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        Shop Dashboard
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => window.location.href = '/dashboard/admin'}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        Admin Panel
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={handleSeedPackages}
                                        disabled={isSeeding || packages.length > 0}
                                        className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        Load Demo Data
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Platform Features */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Features</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>• Multi-Vendor Support</li>
                                <li>• Stripe Connect Integration</li>
                                <li>• Real-time Analytics</li>
                                <li>• Subscription Management</li>
                                <li>• Secure Payments</li>
                                <li>• Admin Dashboard</li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        API Reference
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                        Contact Support
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <p className="text-gray-400 text-sm">
                                © 2024 Shopify Checkout. All rights reserved.
                            </p>
                            <div className="flex space-x-6 mt-4 md:mt-0">
                                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Privacy Policy
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Terms of Service
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                                    Cookie Policy
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Package Modal */}
            <PackageModal
                pkg={selectedPackage}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelectPackage={handleSelectPackage}
            />
        </div>
    );
}