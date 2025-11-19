import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { sidebarData, icons } from '../data/mock';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

interface SidebarContainerProps {
  $isOpen: boolean;
  $isCollapsed: boolean;
}

interface ToggleButtonProps {
  $isOpen: boolean;
}

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
`;

const UserAvatar = styled.div<{ $isCollapsed: boolean }>`
  width: ${({ $isCollapsed }) => ($isCollapsed ? '32px' : '40px')};
  height: ${({ $isCollapsed }) => ($isCollapsed ? '32px' : '40px')};
  border-radius: 50%;
  background-color: ${theme.colors.gray800};
  margin-right: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1rem')};
  flex-shrink: 0;
  transition: all 0.3s ease-in-out;
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
  const userProfileRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (isOpen) {
      setIsCollapsed(!isCollapsed);
    } else {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userProfileRef.current && !userProfileRef.current.contains(event.target as Node)) {
        setIsLogoutVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userProfileRef]);

  return (
    <>
      {!isOpen && (
        <FloatingToggleButton onClick={handleToggle}>
          <FiMenu />
        </FloatingToggleButton>
      )}
      <SidebarContainer $isOpen={isOpen} $isCollapsed={isCollapsed}>
        <LogoContainer $isCollapsed={isCollapsed}>
          <Logo $isCollapsed={isCollapsed}>GUINNESS</Logo>
          {isOpen && (
            <ToggleButton $isOpen={isOpen} onClick={handleToggle}>
              {isCollapsed ? <FiMenu /> : <FiX />}
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
                    // Only auto-close on mobile screens
                    if (window.innerWidth <= 768) {
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
          {isLogoutVisible && !isCollapsed && (
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
              if (isCollapsed) {
                setIsCollapsed(false);
              } else {
                setIsLogoutVisible(!isLogoutVisible);
              }
            }}
          >
            <UserAvatar $isCollapsed={isCollapsed} />
            <UserName $isCollapsed={isCollapsed}>{user.name}</UserName>
          </UserProfile>
        </UserProfileContainer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
