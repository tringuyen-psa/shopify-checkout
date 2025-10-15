import React from 'react';
import { Package } from '@/types/package';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';
import { Eye, Star } from 'lucide-react';

interface PackageCardProps {
  pkg: Package;
  onViewDetails: (pkg: Package) => void;
  className?: string;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  pkg,
  onViewDetails,
  className,
}) => {
  const popularBadge = pkg.name.toLowerCase().includes('enterprise') ||
                       pkg.name.toLowerCase().includes('professional');

  return (
    <Card className={`relative hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {/* Popular Badge */}
      {popularBadge && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
          POPULAR
        </div>
      )}

      <CardHeader className="pb-3">
        {/* Package Image */}
        {pkg.imageUrl ? (
          <img
            src={pkg.imageUrl}
            alt={pkg.name}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md mb-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📦</div>
              <div className="text-gray-500 text-sm">No image</div>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{pkg.name}</CardTitle>
          <div className="flex items-center text-yellow-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-sm ml-1">4.8</span>
          </div>
        </div>

        {pkg.description && (
          <CardDescription className="text-gray-600 line-clamp-2">
            {pkg.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">
            {formatCurrency(pkg.monthlyPrice)}
          </div>
          <div className="text-sm text-gray-500">per month</div>
          <div className="text-xs text-green-600 mt-1">
            Save {Math.round(((pkg.weeklyPrice * 4 - pkg.monthlyPrice) / (pkg.weeklyPrice * 4)) * 100)}% vs weekly
          </div>
        </div>

        {/* Features Preview */}
        {pkg.features && pkg.features.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Key Features:</div>
            <ul className="space-y-1">
              {pkg.features.slice(0, 3).map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></div>
                  {feature}
                </li>
              ))}
              {pkg.features.length > 3 && (
                <li className="text-sm text-gray-500 italic">
                  +{pkg.features.length - 3} more features
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={() => onViewDetails(pkg)}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>

          <Button
            onClick={() => onViewDetails(pkg)}
            className="w-full"
          >
            Get Started
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center text-xs text-gray-500 pt-2 border-t">
          <div>Weekly: {formatCurrency(pkg.weeklyPrice)}</div>
          <div>Yearly: {formatCurrency(pkg.yearlyPrice)}</div>
        </div>
      </CardContent>
    </Card>
  );
};