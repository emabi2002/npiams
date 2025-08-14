import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-8">
          <WifiOff size={48} className="text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">You're Offline</h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          It looks like you're not connected to the internet. Some features may not be available,
          but you can still access cached content.
        </p>

        {/* Available Features */}
        <div className="bg-white rounded-lg border p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 mb-4">Available Offline:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Previously viewed pages
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Cached student data
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Downloaded transcripts
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              Basic navigation
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Go to Dashboard
          </Link>
        </div>

        {/* Tips */}
        <div className="mt-8 text-left">
          <h4 className="font-medium text-gray-800 mb-2">Tips:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Check your internet connection</li>
            <li>• Try refreshing the page</li>
            <li>• Some data will sync when you're back online</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            NPI TVET Academic Management System<br/>
            Papua New Guinea National Polytechnic Institute
          </p>
        </div>
      </div>
    </div>
  );
}
