import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { FiLock, FiTrash2, FiUnlock } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import {
  approveBusiness,
  deleteUserById,
  getPendingBusinesses,
  getUsers,
  rejectBusiness,
  updateUserStatus,
} from '../api/userApi';

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 0.5rem 1.25rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : theme.colors.cardAlt};
  color: ${({ theme, $active }) => ($active ? theme.colors.bg : theme.colors.subtle)};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primaryBright : theme.colors.card};
    color: ${({ theme, $active }) => ($active ? theme.colors.bg : theme.colors.primary)};
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
`;


const StatusBadge = styled.span<{ status: 'active' | 'blocked' }>`
  background-color: ${({ theme, status }) =>
    status === 'active' ? theme.colors.success : theme.colors.warning};
  color: ${({ theme }) => theme.colors.bg};
  padding: 0.18rem 0.45rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: capitalize;
`;

const ApprovalBadge = styled.span<{ status: 'Approved' | 'Pending' | 'Rejected' | '—' }>`
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'Approved':
        return theme.colors.success;
      case 'Rejected':
        return theme.colors.danger;
      case 'Pending':
        return theme.colors.warning;
      default:
        return theme.colors.border;
    }
  }};
  color: ${({ theme }) => theme.colors.bg};
  padding: 0.18rem 0.45rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: capitalize;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.4rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.subtle};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &.delete:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 600px;
  min-height: 600px;
  max-height: 600px;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  flex-shrink: 0;
`;


const SummaryText = styled.p`
  margin-top: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
`;

const PageLayout = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const HeaderStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  flex-shrink: 0;
  margin-bottom: 1.25rem;
  position: relative;
  z-index: 10;
  background: ${({ theme }) => theme.colors.bg};
  padding-bottom: 0.5rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const ContentArea = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
  overflow-x: hidden;
  position: relative;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
`;

const ConfirmOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
`;

const ConfirmDialog = styled.div`
  width: min(420px, 92vw);
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.radii.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text};
`;

const ConfirmMessage = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.subtle};
  line-height: 1.5;
`;

const ConfirmActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const ConfirmButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 0.55rem 1.35rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $variant }) =>
      $variant === 'danger' ? theme.colors.danger : theme.colors.border};
  background: ${({ theme, $variant }) =>
    $variant === 'danger' ? theme.colors.danger : theme.colors.cardAlt};
  color: ${({ theme, $variant }) =>
    $variant === 'danger' ? theme.colors.bg : theme.colors.subtle};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'danger' ? theme.colors.danger : theme.colors.card};
    border-color: ${({ theme, $variant }) =>
      $variant === 'danger' ? theme.colors.danger : theme.colors.primary};
    color: ${({ theme, $variant }) =>
      $variant === 'danger' ? theme.colors.bg : theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const RequestActions = styled.div`
  display: flex;
  gap: 0.35rem;
`;

const RequestActionButton = styled.button<{ $variant: 'approve' | 'reject' }>`
  padding: 0.25rem 0.55rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $variant }) => ($variant === 'approve' ? theme.colors.success : theme.colors.danger)};
  background: transparent;
  color: ${({ theme, $variant }) => ($variant === 'approve' ? theme.colors.success : theme.colors.danger)};
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant }) => ($variant === 'approve' ? theme.colors.success : theme.colors.danger)};
    color: ${({ theme }) => theme.colors.bg};
  }
`;

const ITEMS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type RoleTab = 'consumer' | 'business' | 'requests';

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'consumer' | 'business' | 'admin' | 'other';
  phone: string;
  location: string;
  status: 'active' | 'blocked';
  age: string;
  businessName: string;
  businessApproval: 'Approved' | 'Pending' | 'Rejected' | '—';
  businessType: string;
  businessRegistration: string;
  businessTaxId: string;
  businessOwner: string;
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeRole, setActiveRole] = useState<RoleTab>('consumer');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const trimmedValue = searchTerm.trim();
    if (trimmedValue !== debouncedSearch) {
      setCurrentPage((prev) => (prev === 1 ? prev : 1));
    }

    const handle = window.setTimeout(() => {
      setDebouncedSearch((prev) => (prev === trimmedValue ? prev : trimmedValue));
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeRole]);

  useEffect(() => {
    let isCancelled = false;

    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response =
          activeRole === 'requests'
            ? await getPendingBusinesses({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearch || undefined,
              })
            : await getUsers({
                page: currentPage,
                limit: ITEMS_PER_PAGE,
                search: debouncedSearch || undefined,
                role: activeRole,
              });

        if (isCancelled) return;

        if (response.success) {
          const normalizedUsers = response.data.map((user: any) => {
            if (activeRole === 'requests') {
              const businessInfo =
                typeof user.businessInfo === 'object' && user.businessInfo !== null
                  ? user.businessInfo
                  : {};

              return {
                id: user._id ? String(user._id) : '—',
                firstName: businessInfo.ownerName ?? '—',
                lastName: '—',
                email: user.email ?? businessInfo.email ?? '—',
                role: 'business',
                phone: businessInfo.phone ?? user.phone ?? '—',
                location: businessInfo.address ?? '—',
                status: 'active',
                age: '—',
                businessName: businessInfo.businessName ?? '—',
                businessApproval:
                  businessInfo.approvedByAdmin === true
                    ? 'Approved'
                    : businessInfo.approvedByAdmin === false
                      ? 'Pending'
                      : '—',
                businessType: businessInfo.businessType ?? '—',
                businessRegistration:
                  'registrationNumber' in businessInfo
                    ? String((businessInfo as any).registrationNumber ?? '—')
                    : '—',
                businessTaxId:
                  'taxId' in businessInfo ? String((businessInfo as any).taxId ?? '—') : '—',
                businessOwner: businessInfo.ownerName ?? '—',
              } satisfies UserRow;
            }

            const businessInfo =
              typeof user.businessInfo === 'object' && user.businessInfo !== null
                ? user.businessInfo
                : undefined;

            return {
              id: user._id ? String(user._id) : '—',
              firstName: user.firstName ?? '—',
              lastName: user.lastName ?? '—',
              email: user.email ?? '—',
              role: (user.role === 'consumer' || user.role === 'business' || user.role === 'admin'
                ? user.role
                : 'other'),
              phone: user.phone ?? '—',
              location:
                businessInfo && 'address' in businessInfo
                  ? String((businessInfo as any).address ?? '—')
                  : user.location ?? '—',
              status: user.status === 'blocked' ? 'blocked' : 'active',
              age: user.age != null ? String(user.age) : '—',
              businessName: businessInfo?.businessName ?? '—',
              businessApproval: businessInfo
                ? businessInfo.approvedByAdmin === true
                  ? 'Approved'
                  : businessInfo.approvedByAdmin === false
                    ? 'Rejected'
                    : 'Pending'
                : '—',
              businessType:
                businessInfo && 'businessType' in businessInfo
                  ? String((businessInfo as any).businessType ?? '—')
                  : '—',
              businessRegistration:
                businessInfo && 'registrationNumber' in businessInfo
                  ? String((businessInfo as any).registrationNumber ?? '—')
                  : '—',
              businessTaxId:
                businessInfo && 'taxId' in businessInfo
                  ? String((businessInfo as any).taxId ?? '—')
                  : '—',
              businessOwner:
                businessInfo && 'ownerName' in businessInfo
                  ? String((businessInfo as any).ownerName ?? '—')
                  : '—',
            } satisfies UserRow;
          });

          const filteredUsers =
            debouncedSearch.length > 0
              ? normalizedUsers.filter((user) => {
                  const needle = debouncedSearch.toLowerCase();
                  return (
                    user.firstName.toLowerCase().includes(needle) ||
                    user.lastName.toLowerCase().includes(needle) ||
                    user.email.toLowerCase().includes(needle) ||
                    user.phone.toLowerCase().includes(needle) ||
                    user.location.toLowerCase().includes(needle) ||
                    user.businessName.toLowerCase().includes(needle)
                  );
                })
              : normalizedUsers;

          const derivedTotal = debouncedSearch.length > 0 ? filteredUsers.length : response.total;
          const derivedPages =
            debouncedSearch.length > 0
              ? Math.max(Math.ceil(derivedTotal / ITEMS_PER_PAGE), 1)
              : Math.max(response.totalPages, 1);

          setUsers(filteredUsers);
          setTotalPages(derivedPages);
          setTotalCount(derivedTotal);
        } else {
          toast.error(response.message);
          setUsers([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch users:', error);
          toast.error('Unexpected error while fetching users.');
          setUsers([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedSearch, activeRole]);

  const handleDeleteRequest = useCallback((user: UserRow) => {
    setPendingDelete(user);
  }, []);

  const handleCancelDelete = useCallback(() => {
    if (isDeleting) return;
    setPendingDelete(null);
  }, [isDeleting]);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);

    const result = await deleteUserById(pendingDelete.id);

    if (!result.success) {
      toast.error(result.message);
      setIsDeleting(false);
      return;
    }

    toast.success(result.message);
    setUsers((prev) => prev.filter((user) => user.id !== pendingDelete.id));
    setTotalCount((prev) => Math.max(prev - 1, 0));
    setPendingDelete(null);
    setIsDeleting(false);
  }, [pendingDelete]);

  const handleToggleBlock = useCallback(async (targetUser: UserRow) => {
    if (!targetUser.id || targetUser.id === '—') {
      toast.error('Unable to update status: user identifier missing.');
      return;
    }

    const nextStatus = targetUser.status === 'active' ? 'blocked' : 'active';

    const result = await updateUserStatus({ userId: String(targetUser.id), status: nextStatus });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setUsers((prev) =>
      prev.map((user) =>
        user.id === targetUser.id
          ? {
              ...user,
              status: nextStatus,
            }
          : user,
      ),
    );
  }, []);

  const renderActions = useCallback(
    (user: UserRow) => (
        <ActionsContainer>
        <ActionButton
          className="delete"
          title="Delete user"
          onClick={() => handleDeleteRequest(user)}
        >
            <FiTrash2 />
          </ActionButton>
        <ActionButton
          title={user.status === 'active' ? 'Block user' : 'Unblock user'}
          onClick={() => handleToggleBlock(user)}
        >
            {user.status === 'active' ? <FiLock /> : <FiUnlock />}
          </ActionButton>
        </ActionsContainer>
      ),
    [handleDeleteRequest, handleToggleBlock],
  );

  const columns = useMemo(() => {
    if (activeRole === 'business') {
      return [
        { key: 'businessOwner', header: 'Owner' },
        { key: 'businessType', header: 'Type' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'location', header: 'Location' },
        {
          key: 'businessApproval',
          header: 'Approval',
          render: (user: UserRow) => (
            <ApprovalBadge status={user.businessApproval}>{user.businessApproval}</ApprovalBadge>
          ),
        },
        {
          key: 'status',
          header: 'Account Status',
          render: (user: UserRow) => <StatusBadge status={user.status}>{user.status}</StatusBadge>,
        },
        {
          key: 'actions',
          header: 'Actions',
          render: renderActions,
        },
      ];
    }

    if (activeRole === 'requests') {
      return [
        { key: 'businessName', header: 'Business Name' },
        { key: 'businessOwner', header: 'Owner' },
        { key: 'email', header: 'Business Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'businessType', header: 'Type' },
        { key: 'location', header: 'Address' },
        { key: 'businessRegistration', header: 'Registration #' },
        { key: 'businessTaxId', header: 'Tax ID' },
        {
          key: 'businessApproval',
          header: 'Approval Status',
          render: (user: UserRow) => (
            <ApprovalBadge status={user.businessApproval}>{user.businessApproval}</ApprovalBadge>
          ),
        },
        {
          key: 'requestActions',
          header: 'Approval',
          render: (user: UserRow) => (
            <RequestActions>
              <RequestActionButton
                $variant="approve"
                type="button"
                disabled={user.businessApproval === 'Approved'}
                onClick={async () => {
                  if (!user.id || user.id === '—') {
                    toast.error('Unable to approve: missing identifier.');
                    return;
                  }

                  const result = await approveBusiness(user.id);
                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }

                  toast.success(result.message);
                  setUsers((prev) =>
                    prev.filter((item) => item.id !== user.id),
                  );
                  setTotalCount((prev) => Math.max(prev - 1, 0));
                }}
              >
                Accept
              </RequestActionButton>
              <RequestActionButton
                $variant="reject"
                type="button"
                onClick={async () => {
                  if (!user.id || user.id === '—') {
                    toast.error('Unable to reject: missing identifier.');
                    return;
                  }

                  const result = await rejectBusiness(user.id);
                  if (!result.success) {
                    toast.error(result.message);
                    return;
                  }

                  toast.success(result.message);
                  setUsers((prev) =>
                    prev.filter((item) => item.id !== user.id),
                  );
                  setTotalCount((prev) => Math.max(prev - 1, 0));
                }}
              >
                Reject
              </RequestActionButton>
            </RequestActions>
          ),
        },
      ];
    }

    return [
      { key: 'firstName', header: 'First Name' },
      { key: 'lastName', header: 'Last Name' },
      { key: 'email', header: 'Email' },
      { key: 'phone', header: 'Phone' },
      { key: 'location', header: 'Location' },
      { key: 'age', header: 'Age' },
      {
        key: 'status',
        header: 'Account Status',
        render: (user: UserRow) => <StatusBadge status={user.status}>{user.status}</StatusBadge>,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: renderActions,
      },
    ];
  }, [activeRole, renderActions]);

  return (
    <PageLayout>
      <HeaderStack>
      <Title>Users</Title>
        <TabsContainer>
        <TabButton
          type="button"
          $active={activeRole === 'consumer'}
          onClick={() => setActiveRole('consumer')}
        >
          Consumers
        </TabButton>
        <TabButton
          type="button"
          $active={activeRole === 'business'}
          onClick={() => setActiveRole('business')}
        >
          Businesses
        </TabButton>
        <TabButton
          type="button"
          $active={activeRole === 'requests'}
          onClick={() => setActiveRole('requests')}
        >
          Business Requests
        </TabButton>
        </TabsContainer>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={
          activeRole === 'requests' ? 'Search business requests...' : `Search ${activeRole}s...`
        }
      />
      </HeaderStack>
      <ContentArea>
        {isLoading ? (
          <TableSkeleton columns={columns.length} rows={8} />
        ) : users.length === 0 ? (
          <EmptyState>
            <div>
              <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                {activeRole === 'requests' ? 'No business requests found' : `No ${activeRole}s found`}
              </p>
              <p style={{ fontSize: '0.9rem', color: '#888' }}>
                {debouncedSearch.trim()
                  ? 'Try adjusting your search criteria.'
                  : activeRole === 'requests'
                    ? 'There are no pending business requests at the moment.'
                    : `There are no ${activeRole}s in the system.`}
              </p>
    </div>
          </EmptyState>
        ) : (
          <Table columns={columns} data={users} />
        )}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        <SummaryText>
          {isLoading
            ? `Fetching ${activeRole === 'requests' ? 'business requests' : `${activeRole}s`}...`
            : `Showing page ${Math.min(currentPage, totalPages || 1)} of ${totalPages || 1}. Total ${
                activeRole === 'requests' ? 'business requests' : `${activeRole}s`
              }: ${totalCount}.`}
        </SummaryText>
      </ContentArea>
      {pendingDelete && (
        <ConfirmOverlay>
          <ConfirmDialog>
            <ConfirmTitle>Delete {pendingDelete.firstName} {pendingDelete.lastName}?</ConfirmTitle>
            <ConfirmMessage>
              This action will permanently remove the selected {pendingDelete.role === 'business' ? 'business account' : 'user'}.
              Are you sure you want to proceed?
            </ConfirmMessage>
            <ConfirmActions>
              <ConfirmButton onClick={handleCancelDelete} disabled={isDeleting}>
                Cancel
              </ConfirmButton>
              <ConfirmButton
                $variant="danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </ConfirmButton>
            </ConfirmActions>
          </ConfirmDialog>
        </ConfirmOverlay>
      )}
    </PageLayout>
  );
};

export default UsersPage;
