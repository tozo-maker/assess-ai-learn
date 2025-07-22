
import React, { useEffect, useState } from 'react';
import { useAccessibility } from '@/components/accessibility/AccessibilityProvider';

interface FontLoadingState {
  loaded: boolean;
  error: boolean;
  loading: boolean;
}

export const useFontLoading = () => {
  const [fontState, setFontState] = useState<FontLoadingState>({
    loaded: false,
    error: false,
    loading: true
  });

  useEffect(() => {
    const loadFonts = async () => {
      try {
        // Check if fonts are already loaded
        if (document.fonts && document.fonts.ready) {
          await document.fonts.ready;
          setFontState({ loaded: true, error: false, loading: false });
        } else {
          // Fallback for browsers without FontFace API
          setTimeout(() => {
            setFontState({ loaded: true, error: false, loading: false });
          }, 100);
        }
      } catch (error) {
        console.warn('Font loading failed, using system fonts:', error);
        setFontState({ loaded: false, error: true, loading: false });
      }
    };

    loadFonts();
  }, []);

  return fontState;
};

interface FontLoadingWrapperProps {
  children: React.ReactNode;
  fallbackComponent?: React.ComponentType;
}

export const FontLoadingWrapper: React.FC<FontLoadingWrapperProps> = ({
  children,
  fallbackComponent: FallbackComponent
}) => {
  const fontState = useFontLoading();
  const { announceMessage } = useAccessibility();

  useEffect(() => {
    if (fontState.loaded) {
      announceMessage('Fonts loaded successfully', 'polite');
    } else if (fontState.error) {
      announceMessage('Using system fonts for better compatibility', 'polite');
    }
  }, [fontState.loaded, fontState.error, announceMessage]);

  if (fontState.loading) {
    return (
      <div className="font-feature-optimized" style={{ fontFamily: 'system-ui, sans-serif' }}>
        {children}
      </div>
    );
  }

  if (fontState.error && FallbackComponent) {
    return <FallbackComponent />;
  }

  return (
    <div className={`font-feature-optimized ${fontState.loaded ? 'font-inter' : ''}`}>
      {children}
    </div>
  );
};

// Component for preloading critical fonts
export const FontPreloader: React.FC = () => {
  useEffect(() => {
    // Preload critical font weights
    const fontWeights = ['400', '500', '600', '700'];
    
    fontWeights.forEach(weight => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`;
      
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup preload links if component unmounts
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="font"]');
      preloadLinks.forEach(link => link.remove());
    };
  }, []);

  return null;
};
