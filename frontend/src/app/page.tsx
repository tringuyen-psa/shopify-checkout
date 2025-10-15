'use client';

import React, { useState } from 'react';
import { usePackages } from '@/hooks/usePackages';
import { PackageCard } from '@/components/PackageCard';
import { PackageModal } from '@/components/PackageModal';
import { Button } from '@/components/ui/Button';
import { Package, BillingCycle } from '@/types/package';
import { ShoppingCart, Package as PackageIcon, Star, Zap, User } from 'lucide-react';

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
                            <PackageIcon className="h-8 w-8 text-black mr-3" />
                            <h1 className="text-2xl font-bold text-gray-900">Digital Store</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="outline"
                                onClick={handleSeedPackages}
                                loading={isSeeding}
                                disabled={packages.length > 0}
                            >
                                {packages.length > 0 ? 'Packages Loaded' : 'Load Sample Packages'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/my-purchases'}
                                className="flex items-center space-x-2"
                            >
                                <User className="h-4 w-4" />
                                <span>My Purchases</span>
                            </Button>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ShoppingCart className="h-4 w-4" />
                                <span>Cart (0)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-black to-gray-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold flex items-center">
                            <Zap className="h-4 w-4 mr-2" />
                            BLACK FRIDAY DEAL
                        </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        Premium Digital Solutions
                    </h2>
                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        Choose from our curated selection of digital packages designed to accelerate your growth and transform your business.
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
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <p className="text-gray-600">© 2024 Digital Store. All rights reserved.</p>
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