import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { sidebarData, icons } from '../data/mock';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiAward } from 'react-icons/fi';

interface SidebarContainerProps {
  $isOpen: boolean;
  $isCollapsed: boolean;
}

interface ToggleButtonProps {
  $isOpen: boolean;
}

const SidebarOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: ${({ $isOpen }) => ($isOpen ? '1' : '0')};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;

  @media (min-width: 769px) {
    display: none;
  }
`;

const SidebarContainer = styled.div<SidebarContainerProps>`
  background: ${theme.gradient.goldCard};
  color: ${theme.colors.text};
  width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  height: 100vh;
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '1rem 0.5rem' : '2rem')};
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: all 0.3s ease-in-out;
  z-index: 1000;
  transform: ${({ $isOpen }) => ($isOpen ? 'translateX(0)' : 'translateX(-100%)')};

  @media (max-width: 768px) {
    width: 280px;
    padding: 1.5rem;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
  }
`;

const LogoContainer = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'space-between')};
  margin-bottom: ${({ $isCollapsed }) => ($isCollapsed ? '2rem' : '3rem')};
`;

const Logo = styled.div<{ $isCollapsed: boolean }>`
  font-size: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '2rem')};
  font-weight: bold;
  color: ${theme.colors.primary};
  font-family: ${theme.font.display};
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
  width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : 'auto')};
  overflow: hidden;
  transition: all 0.3s ease-in-out;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  flex-grow: 1;
  overflow-y: auto;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const NavItem = styled.li`
  margin-bottom: 1rem;
`;

const NavLink = styled(RouterNavLink)<{ $isCollapsed: boolean }>`
  color: ${({ theme }) => theme.colors.subtle};
  text-decoration: none;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  padding: ${({ $isCollapsed }) => ($isCollapsed ? '0.8rem' : '0.6rem 1rem')};
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.2s;
  margin: 0.1rem 0;
  position: relative;

  svg {
    margin-right: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1rem')};
    font-size: ${({ $isCollapsed }) => ($isCollapsed ? '1.2rem' : '1.4rem')};
    flex-shrink: 0;
  }

  span {
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
    width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : 'auto')};
    overflow: hidden;
    white-space: nowrap;
    transition: all 0.3s ease-in-out;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primaryBright};
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryBright};
    box-shadow: ${({ $isCollapsed }) => 
      $isCollapsed 
        ? 'none' 
        : `inset 3px 0 0 0 ${theme.colors.primary}`
    };
  }

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
    font-size: 1rem;
    
    svg {
      font-size: 1.3rem;
      margin-right: 1rem;
    }
  }
`;

const UserProfileContainer = styled.div`
  margin-top: auto;
  position: relative;
`;

const UserProfile = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.cardAlt};
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
    padding: 0.75rem;
  }
`;

const UserAvatar = styled.div<{ $isCollapsed: boolean; $avatarUrl?: string }>`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '32px' : '40px')};
  height: ${({ $isCollapsed }) => ($isCollapsed ? '32px' : '40px')};
  border-radius: 50%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryBright});
  background-image: ${({ $avatarUrl }) => ($avatarUrl ? `url(${$avatarUrl})` : 'none')};
  background-size: ${({ $avatarUrl }) => ($avatarUrl ? 'contain' : 'auto')};
  background-position: center;
  background-repeat: no-repeat;
  margin-right: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1rem')};
  flex-shrink: 0;
  transition: all 0.3s ease-in-out;
  border: 2px solid ${theme.colors.primary};
  box-shadow: 0 0 10px ${theme.colors.primary}44;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    right: -2px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${theme.colors.success};
    border: 2px solid ${theme.colors.bg};
    box-shadow: 0 0 4px ${theme.colors.success}88;
  }
`;

const UserName = styled.div<{ $isCollapsed: boolean }>`
  font-weight: bold;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
  width: ${({ $isCollapsed }) => ($isCollapsed ? '0' : 'auto')};
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.3s ease-in-out;
`;

const LogoutPopup = styled.div`
  position: absolute;
  bottom: 100%; /* Changed to open upwards */
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border-radius: ${({ theme }) => theme.radii.sm};
  box-shadow: ${({ theme }) => theme.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 0.25rem; /* Reduced padding */
  margin-bottom: 0.5rem; /* Switched back to margin-bottom */
  z-index: 10;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.subtle};
  width: 100%;
  padding: 0.5rem; /* Reduced padding */
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem; /* Reduced font size */
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryBright};
  }
`;

const ToggleButton = styled.button<ToggleButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.subtle};
  font-size: 1.2rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: ${theme.radii.sm};
  transition: all 0.2s ease-in-out;
  padding: 0;

  &:hover {
    background: ${theme.colors.primarySoft};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primaryBright};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const FloatingToggleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: ${theme.colors.card};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.subtle};
  font-size: 1.2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: ${theme.radii.sm};
  transition: all 0.2s ease-in-out;
  padding: 0;
  box-shadow: ${theme.shadow};

  &:hover {
    background: ${theme.colors.primarySoft};
    border-color: ${theme.colors.primary};
    color: ${theme.colors.primaryBright};
  }

  &:active {
    transform: scale(0.95);
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

interface SidebarProps {
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, setIsOpen, isCollapsed, setIsCollapsed }) => {
  const { user, navItems } = sidebarData;
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const userProfileRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Track if we're on mobile and handle responsive behavior
  useEffect(() => {
    let wasMobile = window.innerWidth <= 768;
    
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      if (mobile && !wasMobile) {
        // Transitioning from desktop to mobile - close sidebar
        setIsOpen(false);
        setIsCollapsed(false);
      } else if (!mobile && wasMobile) {
        // Transitioning from mobile to desktop - open sidebar
        setIsOpen(true);
        setIsCollapsed(false);
      }
      
      wasMobile = mobile;
    };

    // Set initial mobile state
    setIsMobile(wasMobile);
    if (wasMobile) {
      setIsOpen(false);
      setIsCollapsed(false);
    }

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsOpen, setIsCollapsed]);

  const handleToggle = () => {
    if (isOpen) {
      // On mobile, always close the sidebar
      if (isMobile) {
        setIsOpen(false);
      } else {
        // On desktop, toggle collapse
        setIsCollapsed(!isCollapsed);
      }
    } else {
      setIsOpen(true);
      // On mobile, always show full sidebar (not collapsed)
      if (isMobile) {
        setIsCollapsed(false);
      }
    }
  };

  // Handle click outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Handle logout popup click outside
      if (userProfileRef.current && !userProfileRef.current.contains(event.target as Node)) {
        setIsLogoutVisible(false);
      }

      // Handle sidebar click outside on mobile
      if (isMobile && isOpen) {
        if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
          const target = event.target as HTMLElement;
          // Don't close if clicking the toggle button
          if (!target.closest('[data-sidebar-toggle]')) {
            setIsOpen(false);
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMobile, userProfileRef]);

  return (
    <>
      <SidebarOverlay $isOpen={isOpen} onClick={() => setIsOpen(false)} />
      {!isOpen && (
        <FloatingToggleButton data-sidebar-toggle onClick={handleToggle}>
          <FiMenu />
        </FloatingToggleButton>
      )}
      <SidebarContainer ref={sidebarRef} $isOpen={isOpen} $isCollapsed={isCollapsed}>
        <LogoContainer $isCollapsed={isCollapsed}>
          <Logo $isCollapsed={isCollapsed}>GUINNESS</Logo>
          {isOpen && (
            <ToggleButton 
              $isOpen={isOpen} 
              onClick={handleToggle}
              data-sidebar-toggle
            >
              {isMobile ? <FiX /> : isCollapsed ? <FiMenu /> : <FiX />}
            </ToggleButton>
          )}
        </LogoContainer>
        <NavList>
          {navItems.map(item => {
            const Icon = icons[item.icon];
            return (
              <NavItem key={item.id}>
                <NavLink 
                  to={item.path} 
                  $isCollapsed={isCollapsed}
                  onClick={() => {
                    // Auto-close on mobile screens when navigating
                    if (isMobile) {
                      setIsOpen(false);
                    }
                  }}
                >
                  {Icon && <Icon />}
                  <span>{item.title}</span>
                </NavLink>
              </NavItem>
            );
          })}
        </NavList>
        <UserProfileContainer ref={userProfileRef}>
          {isLogoutVisible && (!isCollapsed || isMobile) && (
            <LogoutPopup>
              <LogoutButton onClick={onLogout}>
                <FiLogOut />
                Sign Out
              </LogoutButton>
            </LogoutPopup>
          )}
          <UserProfile 
            $isCollapsed={isCollapsed}
            onClick={() => {
              if (isMobile) {
                // On mobile, show logout popup
                setIsLogoutVisible(!isLogoutVisible);
              } else if (isCollapsed) {
                setIsCollapsed(false);
              } else {
                setIsLogoutVisible(!isLogoutVisible);
              }
            }}
          >
            <UserAvatar $isCollapsed={isCollapsed} $avatarUrl={user.avatar}>
              {!user.avatar && (
                <FiAward 
                  style={{ 
                    color: theme.colors.bg, 
                    fontSize: isCollapsed ? '18px' : '22px',
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                  }} 
                />
              )}
            </UserAvatar>
            <UserName $isCollapsed={isCollapsed}>{user.name}</UserName>
          </UserProfile>
        </UserProfileContainer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
