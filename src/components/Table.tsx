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
  box-sizing: border-box;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
    height: auto;
    min-height: auto;
    max-height: none;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  max-width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.8rem;
  table-layout: fixed;
  box-sizing: border-box;

  @media (max-width: 768px) {
    table-layout: auto;
    width: 100%;
    max-width: 100%;
  }
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
  max-width: 0; /* Force table cells to respect width constraints */
  box-sizing: border-box;
  
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
    grid-template-columns: minmax(100px, 120px) 1fr;
    gap: 0.5rem;
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    max-width: 100%;
    width: 100%;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;

    &::before {
      content: attr(data-label);
      font-weight: bold;
      color: ${({ theme }) => theme.colors.subtle};
      text-transform: uppercase;
      font-size: 0.75rem;
      word-break: break-word;
    }
  }
`;

const Tr = styled.tr`
  @media (max-width: 768px) {
    display: block;
    margin-bottom: 1rem;
    border-radius: ${({ theme }) => theme.radii.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
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
          {data.map((row) => {
            // Check if this is a "no data" row
            const isNoDataRow = row.id === 'no-data';
            
            return (
              <Tr key={row.id}>
                {columns.map((col, index) => {
                  // For no-data row, only render first column and span all columns
                  if (isNoDataRow && index === 0) {
                    return (
                      <Td
                        key={col.key}
                        data-label={col.header}
                        $isCustom={true}
                        colSpan={columns.length}
                        style={{
                          textAlign: 'center',
                          padding: '2rem',
                          color: 'inherit',
                        }}
                      >
                        {col.render ? col.render(row) : <span>{String(row[col.key as keyof T] || 'No data found')}</span>}
                      </Td>
                    );
                  }
                  
                  // Skip other columns for no-data row
                  if (isNoDataRow && index > 0) {
                    return null;
                  }
                  
                  // Normal row rendering
                  return (
                    <Td
                      key={col.key}
                      data-label={col.header}
                      $isCustom={Boolean(col.render)}
                      title={col.render ? undefined : String(row[col.key as keyof T])}
                    >
                      {col.render ? col.render(row) : <span>{String(row[col.key as keyof T])}</span>}
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default Table;
