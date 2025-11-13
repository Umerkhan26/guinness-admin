import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';
import { sidebarData, icons } from '../data/mock';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

interface SidebarContainerProps {
  isOpen: boolean;
}

const SidebarContainer = styled.div<SidebarContainerProps>`
  background: ${theme.gradient.goldCard};
  color: ${theme.colors.text};
  width: 280px;
  height: 100vh;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  transition: transform 0.3s ease-in-out;
  z-index: 1000;

  @media (max-width: 768px) {
    transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-100%)')};
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${theme.colors.primary};
  margin-bottom: 3rem;
  font-family: ${theme.font.display};
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

const NavLink = styled(RouterNavLink)`
  color: ${({ theme }) => theme.colors.subtle};
  text-decoration: none;
  font-size: 1rem; /* Decreased font size */
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem; /* Decreased vertical padding */
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.2s;
  margin: 0.1rem 0; /* Decreased vertical margin */

  svg {
    margin-right: 1rem;
    font-size: 1.4rem; /* Decreased icon size */
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primaryBright};
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primarySoft};
    color: ${({ theme }) => theme.colors.primaryBright};
    box-shadow: inset 3px 0 0 0 ${({ theme }) => theme.colors.primary};
  }
`;

const UserProfileContainer = styled.div`
  margin-top: auto;
  position: relative;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.cardAlt};
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${theme.colors.gray800};
  margin-right: 1rem;
`;

const UserName = styled.div`
  font-weight: bold;
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

const ToggleButton = styled.button`
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 1001;
  background: none;
  border: none;
  color: ${theme.colors.text};
  font-size: 2rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { user, navItems } = sidebarData;
  const [isOpen, setIsOpen] = useState(false);
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const userProfileRef = useRef<HTMLDivElement>(null);

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
      <ToggleButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FiX /> : <FiMenu />}
      </ToggleButton>
      <SidebarContainer isOpen={isOpen}>
        <Logo>GUINNESS</Logo>
        <NavList>
          {navItems.map(item => {
            const Icon = icons[item.icon];
            return (
              <NavItem key={item.id}>
                <NavLink to={item.path} onClick={() => setIsOpen(false)}>
                  {Icon && <Icon />}
                  {item.title}
                </NavLink>
              </NavItem>
            );
          })}
        </NavList>
        <UserProfileContainer ref={userProfileRef}>
          {isLogoutVisible && (
            <LogoutPopup>
              <LogoutButton onClick={onLogout}>
                <FiLogOut />
                Sign Out
              </LogoutButton>
            </LogoutPopup>
          )}
          <UserProfile onClick={() => setIsLogoutVisible(!isLogoutVisible)}>
            <UserAvatar />
            <UserName>{user.name}</UserName>
          </UserProfile>
        </UserProfileContainer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar;
