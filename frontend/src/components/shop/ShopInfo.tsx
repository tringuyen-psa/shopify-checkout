'use client';

import { Shop } from '@/types';

interface ShopInfoProps {
  shop: Shop;
  packageCount: number;
}

export function ShopInfo({ shop, packageCount }: ShopInfoProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-8">
        {/* Shop Logo */}
        <div className="flex-shrink-0 mb-6 md:mb-0">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-24 h-24 rounded-2xl object-cover shadow-md"
            />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-white">
                {shop.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Shop Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{shop.name}</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  KYC Verified
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {packageCount} Products
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <a
              href={`mailto:${shop.email}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact
            </a>
          </div>

          {shop.description && (
            <p className="text-gray-600 leading-relaxed mb-6">{shop.description}</p>
          )}

          {/* Shop Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{packageCount}</div>
              <div className="text-sm text-gray-500">Active Products</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">4.8</div>
              <div className="text-sm text-gray-500">Average Rating</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-500">Support</div>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {['Software', 'Templates', 'Tools'].map((category) => (
              <span
                key={category}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Website Link */}
      {shop.website && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <a
            href={shop.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visit our website
          </a>
        </div>
      )}
    </div>
  );
}