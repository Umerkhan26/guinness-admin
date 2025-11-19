import React from 'react';
import styled from 'styled-components';

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
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.8rem;
  table-layout: fixed;
`;

const Th = styled.th`
  padding: 0.4rem 0.65rem; /* tighter padding */
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.subtle};
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Td = styled.td<{ $isCustom?: boolean }>`
  padding: ${({ $isCustom }) => ($isCustom ? '0.4rem 0.4rem' : '0.45rem 0.6rem')}; /* reduced padding for custom cells */
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.7rem;
  white-space: ${({ $isCustom }) => ($isCustom ? 'normal' : 'nowrap')};
  overflow: ${({ $isCustom }) => ($isCustom ? 'hidden' : 'hidden')};
  text-overflow: ${({ $isCustom }) => ($isCustom ? 'clip' : 'ellipsis')};
  
  /* Ensure custom content (like action buttons) stays within cell */
  ${({ $isCustom }) =>
    $isCustom
      ? `
    > * {
      max-width: 100%;
      overflow: hidden;
    }
  `
      : ''}

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    &::before {
      content: attr(data-label);
      font-weight: bold;
      color: ${({ theme }) => theme.colors.subtle};
      text-transform: uppercase;
      font-size: 0.8rem;
    }
  }
`;

const Tr = styled.tr`
  @media (max-width: 768px) {
    display: block;
    margin-bottom: 1.5rem;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    overflow: hidden;
  }

  &:last-child {
    ${Td} {
      border-bottom: none;
    }
  }
`;

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: readonly Column<T>[] | Column<T>[];
  data: T[];
}

const Table = <T extends { id: string }>({ columns, data }: TableProps<T>) => {
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <Tr>
            {columns.map((col) => (
              <Th key={col.key}>{col.header}</Th>
            ))}
          </Tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <Tr key={row.id}>
              {columns.map((col) => (
                <Td
                  key={col.key}
                  data-label={col.header}
                $isCustom={Boolean(col.render)}
                  title={col.render ? undefined : String(row[col.key as keyof T])}
                >
                  {col.render ? col.render(row) : <span>{String(row[col.key as keyof T])}</span>}
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default Table;
