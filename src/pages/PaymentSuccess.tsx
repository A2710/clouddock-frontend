import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { completePayment } from '@/services/billingService';
import { useAuth } from '@/contexts/AuthContext';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your payment...');
  const [storageAdded, setStorageAdded] = useState<number>(0);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      setMessage('No payment session found');
      return;
    }

    // Complete the payment on the backend
    const finalizePayment = async () => {
      try {
        console.log('📦 Completing payment for session:', sessionId);
        const response = await completePayment(sessionId);

        if (response.success) {
          console.log('✅ Payment completed successfully:', response);
          setStatus('success');
          setMessage('Your storage has been upgraded successfully!');
          setStorageAdded(response.storageAdded || 0);

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/admin/dashboard');
          }, 3000);
        } else {
          throw new Error(response.message || 'Payment completion failed');
        }
      } catch (error: any) {
        console.error('❌ Payment completion error:', error);
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          error.message ||
          'Failed to process your payment. Please contact support.'
        );
      }
    };

    finalizePayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-4">
      <Card className="w-full max-w-md glass-card border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {status === 'processing' && (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful!'}
            {status === 'error' && 'Payment Error'}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'success' && storageAdded > 0 && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-sm text-muted-foreground">Storage Added</p>
              <p className="text-3xl font-bold text-green-500">+{storageAdded} GB</p>
              <p className="text-xs text-muted-foreground mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {status === 'processing' && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Please wait while we confirm your payment...
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                If your payment was successful but you're seeing this error, please refresh your dashboard
                or contact support with your payment details.
              </p>
              <Button
                onClick={() => navigate('/admin/dashboard')}
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full"
            >
              Go to Dashboard Now
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
