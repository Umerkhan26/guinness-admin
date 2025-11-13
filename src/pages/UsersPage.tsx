import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Table from '../components/Table';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { USERS } from '../data/users';
import type { User } from '../data/users';
import { FiEdit, FiTrash2, FiLock, FiUnlock } from 'react-icons/fi';

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem; /* Reduced margin */
`;

const StatusBadge = styled.span<{ status: 'active' | 'blocked' }>`
  background-color: ${({ theme, status }) =>
    status === 'active' ? theme.colors.success : theme.colors.warning};
  color: ${({ theme }) => theme.colors.bg};
  padding: 0.25rem 0.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.8rem;
  font-weight: bold;
  text-transform: capitalize;
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

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState(USERS);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter((user) =>
      Object.values(user).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const currentTableData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return filteredUsers.slice(firstPageIndex, lastPageIndex);
  }, [currentPage, filteredUsers]);

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  const handleToggleBlock = (userId: string) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'active' ? 'blocked' : 'active' }
          : user
      )
    );
  };

  const columns = [
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'status',
      header: 'Status',
      render: (user: User) => <StatusBadge status={user.status}>{user.status}</StatusBadge>,
    },
    { key: 'createdAt', header: 'Joined Date' },
    {
      key: 'actions',
      header: 'Actions',
      render: (user: User) => (
        <ActionsContainer>
          <ActionButton onClick={() => alert(`Editing ${user.firstName}`)}>
            <FiEdit />
          </ActionButton>
          <ActionButton className="delete" onClick={() => handleDelete(user.id)}>
            <FiTrash2 />
          </ActionButton>
          <ActionButton onClick={() => handleToggleBlock(user.id)}>
            {user.status === 'active' ? <FiLock /> : <FiUnlock />}
          </ActionButton>
        </ActionsContainer>
      ),
    },
  ] as { key: string; header: string; render?: (user: User) => React.ReactNode }[];

  return (
    <div>
      <Title>Users</Title>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
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

export default UsersPage;
