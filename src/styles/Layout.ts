import styled from 'styled-components';

interface MainContentProps {
  $sidebarOpen: boolean;
}

export const MainContent = styled.main<MainContentProps & { $sidebarCollapsed?: boolean }>`
  flex-grow: 1;
  padding: 1rem 12px; /* Minimal side padding for full width tables */
  margin-left: ${({ $sidebarOpen, $sidebarCollapsed }) => {
    if (!$sidebarOpen) return '0';
    return $sidebarCollapsed ? '80px' : '280px';
  }};
  min-width: 0; /* Prevents flex item from overflowing its container */
  transition: margin-left 0.3s ease-in-out;

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem; /* Adjust padding for mobile */
  }
`;
