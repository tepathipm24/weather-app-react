import React, { useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import { useThemeContext } from './ThemeContext';
import { useBreakpoint } from '../hooks/useBreakpoint';

interface ResponsiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DrawerOverlay = styled('div')<{ isOpen: boolean }>(({ isOpen }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1200,
  opacity: isOpen ? 1 : 0,
  visibility: isOpen ? 'visible' : 'hidden',
  transition: 'opacity 0.3s ease, visibility 0.3s ease',
  backdropFilter: 'blur(4px)',
}));

const DrawerContainer = styled('div')<{ 
  isOpen: boolean; 
  backgroundColor: string;
  isTablet: boolean;
}>(({ isOpen, backgroundColor, isTablet }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  width: isTablet ? '280px' : '100%',
  maxWidth: isTablet ? '280px' : '320px',
  backgroundColor,
  zIndex: 1300,
  transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
  transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: isOpen 
    ? '0 8px 32px rgba(0, 0, 0, 0.24), 0 0 0 1px rgba(255, 255, 255, 0.05)'
    : 'none',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const DrawerContent = styled('div')({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
});

export const ResponsiveDrawer: React.FC<ResponsiveDrawerProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  const { colors } = useThemeContext();
  const { isTablet } = useBreakpoint();
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node) &&
        overlayRef.current &&
        overlayRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle swipe gestures
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      currentX = e.touches[0].clientX;
      const deltaX = currentX - startX;
      
      // Only allow swiping left (closing)
      if (deltaX < 0) {
        const drawer = drawerRef.current;
        if (drawer) {
          const progress = Math.max(0, Math.min(1, Math.abs(deltaX) / 200));
          drawer.style.transform = `translateX(${deltaX}px)`;
          
          if (overlayRef.current) {
            overlayRef.current.style.opacity = String(1 - progress * 0.5);
          }
        }
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      const deltaX = currentX - startX;
      const drawer = drawerRef.current;
      
      if (drawer) {
        drawer.style.transform = '';
        if (overlayRef.current) {
          overlayRef.current.style.opacity = '';
        }
        
        // Close if swiped more than 100px to the left
        if (deltaX < -100) {
          onClose();
        }
      }
      
      isDragging = false;
      startX = 0;
      currentX = 0;
    };

    const drawer = drawerRef.current;
    drawer.addEventListener('touchstart', handleTouchStart, { passive: true });
    drawer.addEventListener('touchmove', handleTouchMove, { passive: true });
    drawer.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      if (drawer) {
        drawer.removeEventListener('touchstart', handleTouchStart);
        drawer.removeEventListener('touchmove', handleTouchMove);
        drawer.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [isOpen, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      // Focus the first focusable element in the drawer
      const focusableElements = drawerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <DrawerOverlay
        ref={overlayRef}
        isOpen={isOpen}
        onClick={onClose}
        aria-hidden="true"
      />
      <DrawerContainer
        ref={drawerRef}
        isOpen={isOpen}
        backgroundColor={colors.surface}
        isTablet={isTablet}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        id="mobile-navigation-menu"
      >
        <DrawerContent>
          {children}
        </DrawerContent>
      </DrawerContainer>
    </>
  );
};

export default ResponsiveDrawer;