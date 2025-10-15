import React, { useState } from 'react';
import { Purchase, BillingCycle } from '@/types/package';
import {
  getPurchaseStatus,
  getDaysRemaining,
  getBillingCycleLabel,
  formatPrice
} from '@/hooks/usePurchases';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  CreditCard,
  RefreshCw,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface PurchaseCardProps {
  purchase: Purchase;
  onRenew?: (purchaseId: string) => Promise<void>;
  onCancel?: (purchaseId: string) => Promise<void>;
  onExtend?: (purchaseId: string, days: number) => Promise<void>;
  showActions?: boolean;
}

export const PurchaseCard: React.FC<PurchaseCardProps> = ({
  purchase,
  onRenew,
  onCancel,
  onExtend,
  showActions = true,
}) => {
  const [loading, setLoading] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState(30);

  const statusInfo = getPurchaseStatus(purchase);
  const daysRemaining = getDaysRemaining(purchase.endDate);
  const isExpiringSoon = daysRemaining <= 7 && daysRemaining > 0;

  const handleRenew = async () => {
    if (!onRenew) return;
    setLoading(true);
    try {
      await onRenew(purchase.id);
    } catch (error) {
      console.error('Failed to renew purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!onCancel || !confirm('Are you sure you want to cancel this purchase?')) return;
    setLoading(true);
    try {
      await onCancel(purchase.id);
    } catch (error) {
      console.error('Failed to cancel purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!onExtend) return;
    setLoading(true);
    try {
      await onExtend(purchase.id, extendDays);
      setShowExtendModal(false);
    } catch (error) {
      console.error('Failed to extend purchase:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (statusInfo.status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'cancelled':
        return <X className="h-4 w-4" />;
      case 'refunded':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {purchase.package?.name || 'Unknown Package'}
              </h3>
              <p className="text-sm text-gray-600">
                {purchase.package?.description}
              </p>
            </div>
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
              {getStatusIcon()}
              <span>{statusInfo.label}</span>
            </div>
          </div>

          {/* Purchase Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Billing Cycle</span>
              <span className="text-sm font-medium text-gray-900">
                {getBillingCycleLabel(purchase.billingCycle)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Price</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(purchase.price)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Method</span>
              <div className="flex items-center space-x-1">
                <CreditCard className="h-3 w-3 text-gray-400" />
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {purchase.paymentMethod}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Period</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(purchase.startDate).toLocaleDateString()} - {' '}
                {new Date(purchase.endDate).toLocaleDateString()}
              </span>
            </div>

            {/* Time remaining for active purchases */}
            {statusInfo.status === 'active' && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time Remaining</span>
                <span className={`text-sm font-medium ${isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}`}>
                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Expires today'}
                  {isExpiringSoon && ' ⚠️'}
                </span>
              </div>
            )}

            {/* Recurring indicator */}
            {purchase.isRecurring && (
              <div className="flex items-center space-x-1 text-sm text-blue-600">
                <RefreshCw className="h-3 w-3" />
                <span>Auto-renewal enabled</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {showActions && statusInfo.status === 'active' && (
            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRenew}
                loading={loading}
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Renew
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExtendModal(true)}
                className="flex-1"
              >
                <Plus className="h-3 w-3 mr-1" />
                Extend
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                loading={loading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Action buttons for expired purchases */}
          {showActions && statusInfo.status === 'expired' && (
            <div className="flex space-x-2 pt-4 border-t border-gray-100">
              <Button
                variant="default"
                size="sm"
                onClick={handleRenew}
                loading={loading}
                className="flex-1"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Reactivate
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Extend Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Extend Purchase
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add more days to your subscription for {purchase.package?.name}.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of days to add
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={extendDays}
                onChange={(e) => setExtendDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExtendModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExtend}
                loading={loading}
                className="flex-1"
              >
                Extend {extendDays} days
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};