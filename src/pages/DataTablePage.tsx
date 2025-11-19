import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem; /* Reduced margin */
`;

const ITEMS_PER_PAGE = 15;

interface DataItem {
  id: string;
  [key: string]: any;
}

interface DataTablePageProps {
  title: string;
  data: DataItem[];
  columns: { key: string; header: string }[];
}

const DataTablePage: React.FC<DataTablePageProps> = ({ title, data, columns }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, data]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredData]);

  return (
    <div>
      <Title>{title}</Title>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={`Search ${title.toLowerCase()}...`}
      />
      <Table columns={columns} data={currentTableData} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default DataTablePage;
