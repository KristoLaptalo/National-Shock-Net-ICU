/**
 * Admin Portal Login Page
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ROUTES } from '../../config/routes';
import { useAuth } from '../../features/auth/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: authError } = await login({ email, password });

    if (authError) {
      setError(authError.message || 'Failed to sign in. Please check your credentials.');
      setIsSubmitting(false);
      return;
    }

    navigate(ROUTES.ADMIN.DASHBOARD);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
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
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Admin Portal
            </h1>
            <p className="text-gray-500 mt-2">Network Administration</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-shock-red-light text-shock-red rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting || authLoading}
            >
              Login to Admin Portal
            </Button>
          </form>

          {/* Demo Credentials Hint */}
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-700 font-medium mb-1">Demo Credentials:</p>
            <p className="text-xs text-gray-600">
              Email: <code className="bg-white px-1 rounded">admin@shocknet.com</code>
            </p>
            <p className="text-xs text-gray-600">
              Password: <code className="bg-white px-1 rounded">admin123</code>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link
              to={ROUTES.ROOT}
              className="text-sm text-gray-500 hover:text-shock-blue"
            >
              &larr; Back to portal selection
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
