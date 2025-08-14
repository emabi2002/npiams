"use client";

import { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    const checkIfInstalled = () => {
      // Check if running in standalone mode
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              ('standalone' in window.navigator && (window.navigator as any).standalone) ||
                              document.referrer.includes('android-app://');

      setIsStandalone(isStandaloneMode);

      // Check if iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setIsIOS(iOS);

      // If already installed, don't show prompt
      if (isStandaloneMode) {
        setIsInstalled(true);
        return;
      }

      // Check if user has already dismissed the prompt
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const lastDismissed = dismissed ? parseInt(dismissed) : 0;
      const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      if (lastDismissed > oneWeekAgo) {
        return; // Don't show if dismissed within the last week
      }

      // For iOS, show manual install instructions after a delay
      if (iOS && !isStandaloneMode) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds
      }
    };

    checkIfInstalled();

    // Listen for the beforeinstallprompt event (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show the prompt after a short delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);

      // Show success message
      const successDiv = document.createElement('div');
      successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      successDiv.textContent = 'NPIAMS installed successfully!';
      document.body.appendChild(successDiv);

      setTimeout(() => {
        document.body.removeChild(successDiv);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
        handleDismiss();
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or user is on desktop without install prompt
  if (isInstalled || isStandalone || (!deferredPrompt && !isIOS)) {
    return null;
  }

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {isIOS ? (
              <Smartphone className="text-blue-600" size={24} />
            ) : (
              <Monitor className="text-blue-600" size={24} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Install NPIAMS App
            </h3>

            {isIOS ? (
              <div className="text-xs text-gray-600 space-y-2">
                <p>Add to your home screen for quick access:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Tap the share button in Safari</li>
                  <li>Scroll down and tap "Add to Home Screen"</li>
                  <li>Tap "Add" to install</li>
                </ol>
              </div>
            ) : (
              <p className="text-xs text-gray-600 mb-3">
                Install our app for faster access and offline features. Works just like a native app!
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Download size={12} />
                  Install
                </button>
              )}

              <button
                onClick={handleDismiss}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
