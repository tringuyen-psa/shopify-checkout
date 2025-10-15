'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, Home, Download, Mail } from 'lucide-react';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const [purchaseDetails, setPurchaseDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');
  const paymentId = searchParams.get('payment_intent');
  const paypalOrderId = searchParams.get('token');

  useEffect(() => {
    // Here you would typically verify the payment with your backend
    // For now, we'll just show a success message
    const details = {
      sessionId,
      paymentId,
      paypalOrderId,
      timestamp: new Date().toISOString(),
    };
    setPurchaseDetails(details);
  }, [sessionId, paymentId, paypalOrderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div>
              <p className="text-gray-600 mb-2">
                Thank you for your purchase! Your digital package is now active.
              </p>
              <p className="text-sm text-gray-500">
                Order confirmation: {sessionId || paymentId || paypalOrderId || 'N/A'}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">What happens next?</h3>
              <ul className="text-sm text-green-700 space-y-1 text-left">
                <li>• You&apos;ll receive a confirmation email shortly</li>
                <li>• Your package is activated immediately</li>
                <li>• Access your dashboard to manage your subscription</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button className="w-full" onClick={() => window.location.href = '/'}>
                <Home className="h-4 w-4 mr-2" />
                Back to Store
              </Button>

              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>

              <Button variant="ghost" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Resend Confirmation Email
              </Button>
            </div>

            {purchaseDetails && (
              <details className="text-left mt-4">
                <summary className="text-sm text-gray-500 cursor-pointer">
                  View Order Details
                </summary>
                <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                  {JSON.stringify(purchaseDetails, null, 2)}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}