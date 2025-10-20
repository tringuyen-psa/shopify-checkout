import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ShopHeader } from '@/components/shop/ShopHeader';
import { PackageGrid } from '@/components/shop/PackageGrid';
import { ShopInfo } from '@/components/shop/ShopInfo';
import { getShopBySlug, getShopPackages } from '@/lib/api/shops';

interface ShopPageProps {
  params: Promise<{
    shopSlug: string;
  }>;
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);

  if (!shop) {
    return {
      title: 'Shop Not Found',
    };
  }

  return {
    title: `${shop.name} - Digital Store`,
    description: shop.description || `Browse digital products from ${shop.name}`,
    openGraph: {
      title: shop.name,
      description: shop.description,
      images: shop.logo ? [shop.logo] : [],
    },
  };
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);

  if (!shop) {
    notFound();
  }

  const packages = await getShopPackages(shop.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <ShopHeader shop={shop} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shop Info Section */}
        <div className="mb-12">
          <ShopInfo shop={shop} packageCount={packages.length} />
        </div>

        {/* Packages Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Packages ({packages.length})
            </h2>
            <div className="flex items-center space-x-4">
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All Categories</option>
                <option value="software">Software</option>
                <option value="templates">Templates</option>
                <option value="courses">Courses</option>
                <option value="tools">Tools</option>
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {packages.length > 0 ? (
            <PackageGrid packages={packages} shopSlug={shop.slug} />
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No packages available</h3>
                <p className="text-gray-500">This shop hasn't published any packages yet.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}