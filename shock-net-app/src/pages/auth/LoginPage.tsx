/**
 * Portal Selection / Login Page
 */

import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../config/routes';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-shock-blue to-shock-teal">
      <Card className="w-full max-w-md mx-4">
        <CardContent>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-shock-blue-light rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-shock-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              National Shock Net ICU
            </h1>
            <p className="text-gray-500 mt-2">Select your portal to continue</p>
          </div>

          <div className="space-y-4">
            <Button
              fullWidth
              size="lg"
              onClick={() => navigate(ROUTES.HOSPITAL_LOGIN)}
              className="h-16"
            >
              <div className="flex items-center gap-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <div className="text-left">
                  <p className="font-semibold">Hospital Portal</p>
                  <p className="text-sm opacity-80">For physicians and ICU staff</p>
                </div>
              </div>
            </Button>

            <Button
              fullWidth
              size="lg"
              variant="secondary"
              onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
              className="h-16"
            >
              <div className="flex items-center gap-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                <div className="text-left">
                  <p className="font-semibold">Admin Portal</p>
                  <p className="text-sm opacity-80">Network administration</p>
                </div>
              </div>
            </Button>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Secure access for registered ICU facilities only
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
