import { useState, useEffect, useCallback } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

// Optimized breakpoint constants
const MOBILE_BREAKPOINT = 768;
const DESKTOP_BREAKPOINT = 1024;

// Utility function to determine breakpoint
const getBreakpoint = (width: number): Breakpoint => {
  if (width < MOBILE_BREAKPOINT) return 'mobile';
  if (width < DESKTOP_BREAKPOINT) return 'tablet';
  return 'desktop';
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getBreakpoint(window.innerWidth);
  });

  // Memoized resize handler
  const handleResize = useCallback(() => {
    const newBreakpoint = getBreakpoint(window.innerWidth);
    setBreakpoint(current => current !== newBreakpoint ? newBreakpoint : current);
  }, []);

  useEffect(() => {
    // Debounced resize handler for better performance
    let timeoutId: number;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [handleResize]);

  // Memoized return values to prevent unnecessary re-renders
  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
};