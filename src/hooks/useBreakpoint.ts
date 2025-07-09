import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

const breakpoints: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1025,
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    
    const width = window.innerWidth;
    if (width < breakpoints.mobile) return 'mobile';
    if (width < breakpoints.desktop) return 'tablet';
    return 'desktop';
  });

  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      if (width < breakpoints.mobile) {
        setBreakpoint('mobile');
      } else if (width < breakpoints.desktop) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    // Debounce resize events for performance
    let timeoutId: number;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    
    // Initial call
    handleResize();

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    breakpoint,
    windowSize,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  };
};