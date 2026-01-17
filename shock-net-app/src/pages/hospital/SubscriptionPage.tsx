/**
 * Subscription Page - Placeholder
 */

import { Card, CardTitle, CardContent } from '../../components/ui/Card';

export function SubscriptionPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Subscription Details</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800">Current Plan</h3>
              <span className="px-3 py-1 bg-shock-green-light text-shock-green rounded-full font-medium text-sm">
                Active
              </span>
            </div>
            <div className="text-center py-6 border-b">
              <p className="text-4xl font-bold text-shock-blue">Premium</p>
              <p className="text-gray-500 mt-2">50 patients/month</p>
            </div>
            <div className="space-y-4 mt-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Contract Number</span>
                <span className="font-mono">NSN-CONT-2026-0042</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date</span>
                <span>January 1, 2026</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry Date</span>
                <span>December 31, 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Monthly Usage</CardTitle>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-5xl font-bold text-gray-800">18</p>
              <p className="text-gray-500">of 50 submissions</p>
              <p className="text-shock-green mt-2">32 remaining</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SubscriptionPage;
