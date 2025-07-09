import React from 'react';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useThemeContext } from './ThemeContext';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const HamburgerIcon = styled('div')<{ isOpen: boolean; textColor: string }>(({ isOpen, textColor }) => ({
  width: '24px',
  height: '18px',
  position: 'relative',
  cursor: 'pointer',
  
  '& .hamburger-line': {
    display: 'block',
    height: '2px',
    width: '100%',
    backgroundColor: textColor,
    borderRadius: '1px',
    position: 'absolute',
    left: 0,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    transformOrigin: 'center',
  },
  
  '& .line-1': {
    top: isOpen ? '8px' : '0px',
    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
  },
  
  '& .line-2': {
    top: '8px',
    opacity: isOpen ? 0 : 1,
    transform: isOpen ? 'translateX(20px)' : 'translateX(0)',
  },
  
  '& .line-3': {
    top: isOpen ? '8px' : '16px',
    transform: isOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  padding: '12px',
  borderRadius: '8px',
  minWidth: '44px',
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: theme.palette.mode === 'light' 
      ? 'rgba(0, 0, 0, 0.04)' 
      : 'rgba(255, 255, 255, 0.08)',
    transform: 'scale(1.05)',
  },
  
  '&:active': {
    transform: 'scale(0.95)',
  },
  
  // Focus styles for accessibility
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
  },
}));

export const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  isOpen,
  onClick,
  className,
}) => {
  const { colors } = useThemeContext();

  return (
    <StyledIconButton
      onClick={onClick}
      className={className}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      aria-expanded={isOpen}
      aria-controls="mobile-navigation-menu"
      role="button"
    >
      <HamburgerIcon isOpen={isOpen} textColor={colors.text}>
        <span className="hamburger-line line-1" />
        <span className="hamburger-line line-2" />
        <span className="hamburger-line line-3" />
      </HamburgerIcon>
    </StyledIconButton>
  );
};

export default MobileMenuButton;