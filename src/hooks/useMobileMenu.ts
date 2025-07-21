import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreakpoint } from './useBreakpoint';

export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const location = useLocation();

  // Optimized close function
  const close = useCallback(() => setIsOpen(false), []);

  // Optimized toggle function
  const toggle = useCallback(() => {
    if (isMobile) {
      setIsOpen(prev => !prev);
    }
  }, [isMobile]);

  // Consolidated effect for menu state management
  useEffect(() => {
    // Close menu when route changes or screen size changes to desktop
    if (isOpen && !isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile, isOpen]);

  // Consolidated effect for body scroll lock and escape key handling
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    // Handle body scroll lock
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    // Handle escape key
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscape, { passive: true });

    return () => {
      // Restore body styles
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.width = originalWidth;
      
      // Remove event listener
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isMobile, close]);

  return {
    isOpen: isOpen && isMobile,
    close,
    toggle,
  };
};