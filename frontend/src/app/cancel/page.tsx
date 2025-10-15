'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { XCircle, Home, ArrowLeft, RefreshCw } from 'lucide-react';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <XCircle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">Payment Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <p className="text-gray-600 mb-2">
                Your payment was cancelled. No charges were made to your account.
              </p>
              <p className="text-sm text-gray-500">
                If you changed your mind, you can always come back and complete your purchase later.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-700">
                If you encountered any issues during checkout, please don&apos;t hesitate to contact our support team.
              </p>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Back to Store
              </Button>

              <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Try Again
              </Button>

              <Button variant="ghost" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}