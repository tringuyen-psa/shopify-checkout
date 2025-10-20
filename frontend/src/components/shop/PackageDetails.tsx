'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from '@/types';

interface PackageDetailsProps {
  packageData: Package;
}

export function PackageDetails({ packageData }: PackageDetailsProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');

  const images = packageData.images || [];
  const hasImages = images.length > 0;

  return (
    <div className="space-y-8">
      {/* Image Gallery */}
      {hasImages && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Main Image */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={images[selectedImage]}
                alt={packageData.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${packageData.name} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Package Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {['description', 'features', 'requirements'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="prose max-w-none">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {packageData.description || 'No description available.'}
              </div>

              {/* Package Metadata */}
              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium text-gray-900">{packageData.category || 'General'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Type</div>
                  <div className="font-medium text-gray-900">
                    {packageData.isSubscription ? 'Subscription' : 'One-time Purchase'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Features & Benefits</h3>
              {packageData.features && packageData.features.length > 0 ? (
                <ul className="space-y-3">
                  {packageData.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No specific features listed.</p>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">System Requirements</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Digital Product Notice</p>
                    <p>This is a digital product. No physical shipping required.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-gray-700">
                <h4 className="font-medium text-gray-900">General Requirements:</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Valid email address for delivery</li>
                  <li>• Internet connection for download</li>
                  <li>• Sufficient storage space</li>
                </ul>

                {packageData.isSubscription && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Subscription Details:</h4>
                    <ul className="space-y-1 text-sm text-blue-800">
                      {packageData.trialDays && packageData.trialDays > 0 && (
                        <li>• {packageData.trialDays} days free trial included</li>
                      )}
                      <li>• Cancel anytime</li>
                      <li>• Access updates during subscription period</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}