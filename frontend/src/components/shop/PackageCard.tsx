'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Package } from '@/types';

interface PackageCardProps {
  package: Package;
  shopSlug: string;
}

export function PackageCard({ package: pkg, shopSlug }: PackageCardProps) {
  const getPriceDisplay = () => {
    if (pkg.isSubscription) {
      const prices = [];
      if (pkg.weeklyPrice) prices.push(`$${pkg.weeklyPrice}/week`);
      if (pkg.monthlyPrice) prices.push(`$${pkg.monthlyPrice}/month`);
      if (pkg.yearlyPrice) prices.push(`$${pkg.yearlyPrice}/year`);
      return prices.length > 0 ? `From ${prices[0]}` : 'Custom Pricing';
    }
    return `$${pkg.basePrice}`;
  };

  const getTrialText = () => {
    if (pkg.trialDays && pkg.trialDays > 0) {
      return `${pkg.trialDays} days free`;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Package Image */}
      <div className="relative h-48 bg-gray-100">
        {pkg.images && pkg.images.length > 0 ? (
          <Image
            src={pkg.images[0]}
            alt={pkg.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="text-white text-center">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="text-sm font-medium">Digital Package</span>
            </div>
          </div>
        )}

        {/* Trial Badge */}
        {getTrialText() && (
          <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            {getTrialText()}
          </div>
        )}

        {/* Subscription Badge */}
        {pkg.isSubscription && (
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            Subscription
          </div>
        )}
      </div>

      {/* Package Content */}
      <div className="p-6">
        {/* Category */}
        {pkg.category && (
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {pkg.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {pkg.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {pkg.description}
        </p>

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-1">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="line-clamp-1">{feature}</span>
                </li>
              ))}
              {pkg.features.length > 3 && (
                <li className="text-sm text-gray-500">
                  +{pkg.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {getPriceDisplay()}
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href={`/${shopSlug}/${pkg.slug}`}
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}