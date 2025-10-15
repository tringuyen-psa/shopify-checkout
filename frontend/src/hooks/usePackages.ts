import { useState, useEffect } from 'react';
import { packageApi } from '@/lib/api';
import { Package } from '@/types/package';

export const usePackages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await packageApi.getAll();
      setPackages(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch packages');
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularPackages = async (limit?: number) => {
    try {
      const response = await packageApi.getPopular(limit);
      return response.data;
    } catch (err) {
      console.error('Error fetching popular packages:', err);
      return [];
    }
  };

  const searchPackages = async (query: string) => {
    try {
      const response = await packageApi.search(query);
      return response.data;
    } catch (err) {
      console.error('Error searching packages:', err);
      return [];
    }
  };

  const seedPackages = async () => {
    try {
      const response = await packageApi.seed();
      return response.data;
    } catch (err) {
      console.error('Error seeding packages:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages,
    fetchPopularPackages,
    searchPackages,
    seedPackages,
  };
};

export const usePackage = (id: string) => {
  const [pkg, setPackage] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await packageApi.getById(id);
        setPackage(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch package');
        console.error('Error fetching package:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
  }, [id]);

  return {
    package: pkg,
    loading,
    error,
  };
};