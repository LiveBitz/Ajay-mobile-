import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Icon */}
        <div className="flex justify-center">
          <div className="text-7xl font-bold text-brand">404</div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900">
            Page Not Found
          </h1>
          <p className="text-zinc-600">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
        </div>

        {/* Suggestions */}
        <div className="space-y-3 text-left bg-zinc-50 rounded-lg p-4">
          <p className="text-sm font-semibold text-zinc-900">What you can do:</p>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>✓ Check the URL for typos</li>
            <li>✓ Return to the homepage</li>
            <li>✓ Browse our collection</li>
            <li>✓ Contact customer support</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Link href="/" className="flex-1">
            <Button className="w-full">Go Home</Button>
          </Link>
          <Link href="/category" className="flex-1">
            <Button variant="outline" className="w-full">
              Shop
            </Button>
          </Link>
        </div>

        {/* Support */}
        <div className="text-xs text-zinc-500 pt-4 border-t">
          <p>
            Need help? Email{' '}
            <a href="mailto:support@souled.com" className="text-brand hover:underline">
              support@souled.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
