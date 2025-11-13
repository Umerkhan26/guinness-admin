import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import CreateBusinessForm from '../components/CreateBusinessForm';
import { BUSINESSES } from '../data/businesses';
import type { Business } from '../data/businesses';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem; /* Reduced margin */
`;

const Title = styled.h1`
  font-size: 2.5rem;
`;

const CreateButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryBright};
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.subtle};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &.delete:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const ITEMS_PER_PAGE = 20;

const BusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState(BUSINESSES);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredBusinesses = useMemo(() => {
    if (!searchTerm) return businesses;
    return businesses.filter((business) =>
      Object.values(business).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, businesses]);

  const totalPages = Math.ceil(filteredBusinesses.length / ITEMS_PER_PAGE);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return filteredBusinesses.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredBusinesses]);

  const handleAddBusiness = (newBusiness: Business) => {
    setBusinesses([newBusiness, ...businesses]);
  };

  const handleDelete = (businessId: string) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      setBusinesses(businesses.filter((business) => business.id !== businessId));
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'owner', header: 'Owner' },
    { key: 'type', header: 'Type' },
    { key: 'location', header: 'Location' },
    { key: 'phone', header: 'Phone' },
    { key: 'email', header: 'Email' },
    {
      key: 'actions',
      header: 'Actions',
      render: (business: Business) => (
        <ActionsContainer>
          <ActionButton onClick={() => alert(`Editing ${business.name}`)}>
            <FiEdit />
          </ActionButton>
          <ActionButton className="delete" onClick={() => handleDelete(business.id)}>
            <FiTrash2 />
          </ActionButton>
        </ActionsContainer>
      ),
    },
  ] as { key: string; header: string; render?: (item: Business) => React.ReactNode }[];

  return (
    <div>
      <PageHeader>
        <Title>Businesses</Title>
        <CreateButton onClick={() => setIsModalOpen(true)}>
          <FiPlus />
          Create Business
        </CreateButton>
      </PageHeader>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search businesses..."
      />
      <Table columns={columns} data={currentTableData} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateBusinessForm
          onAddBusiness={handleAddBusiness}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default BusinessesPage;
