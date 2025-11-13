import styled from 'styled-components';

export const MainContent = styled.main`
  flex-grow: 1;
  padding: 1rem 2rem; /* Further reduced top padding */
  margin-left: 280px;
  min-width: 0; /* Prevents flex item from overflowing its container */

  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem; /* Adjust padding for mobile */
  }
`;
