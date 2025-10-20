import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PackageHeader } from '@/components/shop/PackageHeader';
import { PackageDetails } from '@/components/shop/PackageDetails';
import { RelatedPackages } from '@/components/shop/RelatedPackages';
import { getShopBySlug, getPackageBySlug } from '@/lib/api/shops';
import { CheckoutButton } from '@/components/checkout/CheckoutButton';

interface PackagePageProps {
  params: {
    shopSlug: string;
    packageSlug: string;
  };
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const packageData = await getPackageBySlug(params.packageSlug, params.shopSlug);

  if (!packageData) {
    return {
      title: 'Package Not Found',
    };
  }

  return {
    title: `${packageData.name} - ${packageData.shop?.name || 'Unknown Shop'}`,
    description: packageData.description,
    openGraph: {
      title: packageData.name,
      description: packageData.description,
      images: packageData.images?.[0] ? [packageData.images[0]] : [],
    },
  };
}

export default async function PackagePage({ params }: PackagePageProps) {
  const shop = await getShopBySlug(params.shopSlug);
  const packageData = await getPackageBySlug(params.packageSlug, params.shopSlug);

  if (!shop || !packageData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Package Header */}
      <PackageHeader shop={shop} packageData={packageData} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Package Details - Left */}
          <div className="lg:col-span-2">
            <PackageDetails packageData={packageData} />
          </div>

          {/* Pricing & Checkout - Right */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Pricing Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  {packageData.isSubscription ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 mb-2">Starting at</div>
                        <div className="text-3xl font-bold text-gray-900">
                          ${packageData.weeklyPrice || packageData.monthlyPrice || packageData.yearlyPrice}
                          <span className="text-lg font-normal text-gray-500">
                            /{packageData.weeklyPrice ? 'week' : packageData.monthlyPrice ? 'month' : 'year'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {packageData.weeklyPrice && (
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Weekly - ${packageData.weeklyPrice}
                          </button>
                        )}
                        {packageData.monthlyPrice && (
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Monthly - ${packageData.monthlyPrice}
                          </button>
                        )}
                        {packageData.yearlyPrice && (
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            Yearly - ${packageData.yearlyPrice}
                          </button>
                        )}
                        {packageData.basePrice && (
                          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                            One Time - ${packageData.basePrice}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-500 mb-2">One-time purchase</div>
                      <div className="text-3xl font-bold text-gray-900">
                        ${packageData.basePrice}
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkout Button */}
                <CheckoutButton
                  packageId={packageData.id}
                  shopId={packageData.shopId}
                  packageSlug={packageData.slug}
                  shopSlug={shop.slug}
                />

                {/* Features */}
                {packageData.features && packageData.features.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">What's included:</h3>
                    <ul className="space-y-2">
                      {packageData.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trial Period */}
                {packageData.trialDays && packageData.trialDays > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-blue-700">
                        {packageData.trialDays} days free trial included
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Shop Info Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  {shop.logo && (
                    <img
                      src={shop.logo}
                      alt={shop.name}
                      className="w-12 h-12 rounded-lg mr-3 object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{shop.name}</h3>
                    <p className="text-sm text-gray-500">Verified Seller</p>
                  </div>
                </div>

                {shop.description && (
                  <p className="text-sm text-gray-600 mb-4">{shop.description}</p>
                )}

                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  KYC Verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Packages */}
        <div className="mt-16">
          <RelatedPackages
            packageId={packageData.id}
            shopId={packageData.shopId}
            category={packageData.category}
          />
        </div>
      </main>
    </div>
  );
}