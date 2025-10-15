import React, { useState } from 'react';
import { Package, BillingCycle } from '@/types/package';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatCurrency, getBillingCycleLabel, getBillingCycleDiscount } from '@/lib/utils';
import { Check, Zap, Shield, Headphones } from 'lucide-react';

interface PackageModalProps {
  pkg: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPackage: (pkg: Package, billingCycle: BillingCycle) => void;
  loading?: boolean;
}

const billingCycleOptions = [
  { value: BillingCycle.WEEKLY, label: 'Weekly' },
  { value: BillingCycle.MONTHLY, label: 'Monthly' },
  { value: BillingCycle.YEARLY, label: 'Yearly' },
];

export const PackageModal: React.FC<PackageModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSelectPackage,
  loading = false,
}) => {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);

  if (!pkg) return null;

  const getPrice = () => {
    switch (selectedCycle) {
      case BillingCycle.WEEKLY:
        return pkg.weeklyPrice;
      case BillingCycle.MONTHLY:
        return pkg.monthlyPrice;
      case BillingCycle.YEARLY:
        return pkg.yearlyPrice;
      default:
        return pkg.monthlyPrice;
    }
  };

  const getDiscount = () => {
    const basePrice = pkg.weeklyPrice;
    const cyclePrice = getPrice();
    const multiplier = selectedCycle === BillingCycle.WEEKLY ? 1 :
                      selectedCycle === BillingCycle.MONTHLY ? 4 : 52;
    return getBillingCycleDiscount(basePrice * multiplier, cyclePrice);
  };

  const handleSelectPackage = () => {
    onSelectPackage(pkg, selectedCycle);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pkg.name}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          {pkg.imageUrl ? (
            <img
              src={pkg.imageUrl}
              alt={pkg.name}
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">📦</div>
                <div className="text-gray-500">No image available</div>
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
          {pkg.description && (
            <p className="text-gray-600 max-w-2xl mx-auto">{pkg.description}</p>
          )}
        </div>

        {/* Billing Cycle Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose your billing cycle:
          </label>
          <Select
            value={selectedCycle}
            onChange={(e) => setSelectedCycle(e.target.value as BillingCycle)}
            options={billingCycleOptions}
            className="w-full"
          />
        </div>

        {/* Pricing */}
        <div className="text-center bg-white p-6 rounded-lg border-2 border-gray-200">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {formatCurrency(getPrice())}
          </div>
          <div className="text-lg text-gray-600 mb-2">
            per {getBillingCycleLabel(selectedCycle).toLowerCase()}
          </div>

          {getDiscount() > 0 && (
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Save {getDiscount()}% compared to weekly billing
            </div>
          )}

          {/* Price Comparison */}
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="text-gray-500">Weekly</div>
              <div className="font-medium">{formatCurrency(pkg.weeklyPrice)}</div>
            </div>
            <div className="text-center border-l border-r border-gray-200">
              <div className="text-gray-500">Monthly</div>
              <div className="font-medium">{formatCurrency(pkg.monthlyPrice)}</div>
            </div>
            <div className="text-center">
              <div className="text-gray-500">Yearly</div>
              <div className="font-medium">{formatCurrency(pkg.yearlyPrice)}</div>
            </div>
          </div>
        </div>

        {/* Features */}
        {pkg.features && pkg.features.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">What's included:</h4>
            <ul className="space-y-3">
              {pkg.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Benefits */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <Zap className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">Instant Access</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">30-Day Guarantee</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <Headphones className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-medium text-gray-900">24/7 Support</div>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="outline"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSelectPackage}
          loading={loading}
          className="min-w-[140px]"
        >
          Buy Now - {formatCurrency(getPrice())}
        </Button>
      </ModalFooter>
    </Modal>
  );
};