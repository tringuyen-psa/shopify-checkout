import { Shop, Package } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  try {
    const response = await fetch(`${API_URL}/shops/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch shop');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching shop:', error);
    return null;
  }
}

export async function getShopPackages(shopId: string): Promise<Package[]> {
  try {
    const response = await fetch(`${API_URL}/shops/${shopId}/packages`);
    if (!response.ok) {
      throw new Error('Failed to fetch shop packages');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching shop packages:', error);
    return [];
  }
}

export async function getPackageBySlug(packageSlug: string, shopSlug: string): Promise<Package | null> {
  try {
    // In a real implementation, you would have an API endpoint that accepts both slugs
    // For now, we'll get all packages and filter by slug
    const shop = await getShopBySlug(shopSlug);
    if (!shop) return null;

    const packages = await getShopPackages(shop.id);
    return packages.find(pkg => pkg.slug === packageSlug) || null;
  } catch (error) {
    console.error('Error fetching package:', error);
    return null;
  }
}

export async function getAllShops(): Promise<Shop[]> {
  try {
    const response = await fetch(`${API_URL}/shops`);
    if (!response.ok) {
      throw new Error('Failed to fetch shops');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching shops:', error);
    return [];
  }
}

export async function getAllPackages(): Promise<Package[]> {
  try {
    const response = await fetch(`${API_URL}/packages`);
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
}

export async function getRelatedPackages(packageId: string, shopId: string, category?: string): Promise<Package[]> {
  try {
    const params = new URLSearchParams({
      excludeId: packageId,
      limit: '6'
    });

    if (category) {
      params.append('category', category);
    }

    const response = await fetch(`${API_URL}/packages/related?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch related packages');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching related packages:', error);
    return [];
  }
}