import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreakpoint } from './useBreakpoint';

export const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useBreakpoint();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  // Close menu when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
    }
  }, [isMobile, isOpen]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen && isMobile) {
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen, isMobile]);

  const open = useCallback(() => {
    if (isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    if (isMobile) {
      setIsOpen(prev => !prev);
    }
  }, [isMobile]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, close]);

  return {
    isOpen: isOpen && isMobile, // Only show as open on mobile
    open,
    close,
    toggle,
    isMobile,
  };
};