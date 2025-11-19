import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const TableWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.5rem 12px;
  box-shadow: ${({ theme }) => theme.shadow};
  border: 1px solid ${({ theme }) => theme.colors.border};
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  max-width: 100%;
  height: 600px;
  min-height: 600px;
  max-height: 600px;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.8rem;
  table-layout: fixed;
`;

const Th = styled.th`
  padding: 0.4rem 0.65rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.subtle};
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Td = styled.td`
  padding: 0.45rem 0.6rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.7rem;
`;

const Tr = styled.tr`
  &:last-child {
    ${Td} {
      border-bottom: none;
    }
  }
`;

interface SkeletonCellProps {
  $width?: string;
}

const SkeletonCell = styled.div<SkeletonCellProps>`
  height: 16px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.cardAlt} 0%,
    ${({ theme }) => theme.colors.border} 50%,
    ${({ theme }) => theme.colors.cardAlt} 100%
  );
  background-size: 1000px 100%;
  animation: ${shimmer} 2s infinite;
  width: ${({ $width }) => $width || '100%'};
`;

interface TableSkeletonProps {
  columns: number;
  rows?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns, rows = 8 }) => {
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <Tr>
            {Array.from({ length: columns }).map((_, index) => (
              <Th key={index}>
                <SkeletonCell $width="60%" />
              </Th>
            ))}
          </Tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <Tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Td key={colIndex}>
                  <SkeletonCell $width={colIndex === 0 ? '80%' : colIndex === columns - 1 ? '40%' : '70%'} />
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default TableSkeleton;

