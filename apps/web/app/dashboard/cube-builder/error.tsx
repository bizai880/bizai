'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function CubeBuilderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Cube builder error:', error);
  }, [error]);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-lg mx-auto text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">حدث خطأ!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          عذراً، حدث خطأ أثناء تحميل مصمم المكعبات. يرجى المحاولة مرة أخرى.
        </p>
        <div className="space-y-4">
          <Button onClick={reset} className="w-full">
            إعادة المحاولة
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <a href="/dashboard">العودة للوحة التحكم</a>
          </Button>
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded text-left">
            <pre className="text-sm overflow-auto">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}