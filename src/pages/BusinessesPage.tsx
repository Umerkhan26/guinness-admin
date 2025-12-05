import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { deleteBusiness, getBusinesses } from '../api/businessApi';
import Modal from '../components/Modal';
import CreateBusinessForm from '../components/CreateBusinessForm';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
`;

const CreateButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryBright};
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

const ActionsContainer = styled.div`
  display: inline-flex;
  gap: 0.4rem;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.subtle};
  display: inline-flex;
  align-items: center;
  font-size: 1rem;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &.delete:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const ConfirmBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: min(420px, 100%);
`;

const ConfirmTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
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
`;

const ConfirmButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 0.55rem 1.25rem;
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

const ITEMS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type BusinessRow = {
  id: string;
  name: string;
  description: string;
  earnPointsDisplay: string;
  earnPointsType: string;
  earnPointsValue: number;
  methodDisplay: string;
  methodRaw: string;
  status: 'Active' | 'Inactive';
  isActive: boolean;
  createdAt: string;
};

const BusinessesPage: React.FC = () => {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBusiness, setEditingBusiness] = useState<BusinessRow | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<BusinessRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  useEffect(() => {
    let isCancelled = false;

    const fetchBusinesses = async () => {
      setIsLoading(true);
      const response = await getBusinesses({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
      });

      if (isCancelled) return;

      if (response.success) {
        const rows = response.data.map((business) => {
          const earnTypeRaw = business.earnPoints?.type ?? 'per_4_packs';
          const earnValueRaw = business.earnPoints?.value ?? 0;
          const earnValueDisplay = `${earnTypeRaw.replace(/_/g, ' ')} · ${earnValueRaw}`;

          const methodRaw = business.method ?? 'upload_receipt';
          const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

          return {
            id: business._id ?? fallbackId,
            name: business.name ?? '—',
            description: business.description ?? '—',
            earnPointsDisplay: earnValueDisplay,
            earnPointsType: earnTypeRaw,
            earnPointsValue: earnValueRaw,
            methodDisplay: methodRaw.replace(/_/g, ' '),
            methodRaw,
            status: business.isActive ? 'Active' : 'Inactive',
            isActive: Boolean(business.isActive),
            createdAt: business.createdAt
              ? new Date(business.createdAt).toLocaleDateString()
              : '—',
          } satisfies BusinessRow;
        });

        setBusinesses(rows);
        setTotalPages(Math.max(response.pagination.totalPages, 1));
        setTotalCount(response.pagination.total);
      } else {
        toast.error(response.message);
        setBusinesses([]);
        setTotalPages(1);
        setTotalCount(0);
      }

      setIsLoading(false);
    };

    fetchBusinesses().catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch businesses:', error);
        toast.error('Unexpected error while fetching businesses.');
        setBusinesses([]);
        setTotalPages(1);
        setTotalCount(0);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedSearch, refreshVersion]);

  const handleEdit = useCallback((business: BusinessRow) => {
    setModalMode('edit');
    setEditingBusiness(business);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((business: BusinessRow) => {
    setPendingDelete(business);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const response = await deleteBusiness(pendingDelete.id);
    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete business.');
      setIsDeleting(false);
      return;
    }

    toast.success(response.message ?? 'Business deleted successfully.');
    setIsDeleting(false);
    setPendingDelete(null);
    setRefreshVersion((prev) => prev + 1);
  }, [pendingDelete]);

  const columns = useMemo(
    () =>
      [
        { key: 'name', header: 'Name' },
        { key: 'description', header: 'Description' },
        { key: 'earnPointsDisplay', header: 'Earn Points' },
        { key: 'methodDisplay', header: 'Method' },
        { key: 'status', header: 'Status' },
        { key: 'createdAt', header: 'Created' },
        {
          key: 'actions',
          header: 'Actions',
          render: (business: BusinessRow) => (
            <ActionsContainer>
              <ActionButton title="Edit business" onClick={() => handleEdit(business)}>
                <FiEdit />
              </ActionButton>
              <ActionButton
                className="delete"
                title="Delete business"
                onClick={() => handleDelete(business)}
              >
                <FiTrash2 />
              </ActionButton>
            </ActionsContainer>
          ),
        },
      ],
    [handleEdit, handleDelete],
  );

  return (
    <div>
      <Header>
        <Title>Businesses</Title>
        <CreateButton
          onClick={() => {
            setModalMode('create');
            setEditingBusiness(null);
            setIsModalOpen(true);
          }}
        >
          <FiPlus />
          Create Business
        </CreateButton>
      </Header>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search businesses..."
      />
      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={8} />
      ) : businesses.length === 0 ? (
        <EmptyState>
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              No businesses found
            </p>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              {debouncedSearch.trim()
                ? 'Try adjusting your search criteria.'
                : 'There are no businesses in the system.'}
            </p>
          </div>
        </EmptyState>
      ) : (
        <Table columns={columns} data={businesses} />
      )}
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      <SummaryText>
        {isLoading
          ? 'Fetching businesses...'
          : `Showing page ${Math.min(currentPage, totalPages || 1)} of ${totalPages || 1}. Total businesses: ${totalCount}.`}
      </SummaryText>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateBusinessForm
          mode={modalMode}
          initialValues={
            modalMode === 'edit' && editingBusiness
              ? {
                  id: editingBusiness.id,
                  name: editingBusiness.name,
                  description: editingBusiness.description !== '—' ? editingBusiness.description : '',
                  earnPointsType: editingBusiness.earnPointsType,
                  earnPointsValue: editingBusiness.earnPointsValue || 10,
                  method: editingBusiness.methodRaw,
                  isActive: editingBusiness.isActive,
                }
              : undefined
          }
          onCreated={() => {
            setRefreshVersion((prev) => prev + 1);
          }}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
      <Modal isOpen={Boolean(pendingDelete)} onClose={() => (isDeleting ? undefined : setPendingDelete(null))}>
        {pendingDelete && (
          <ConfirmBody>
            <ConfirmTitle>Delete {pendingDelete.name}?</ConfirmTitle>
            <ConfirmMessage>
              This action will permanently remove the business from the catalog.
              Are you sure you want to proceed?
            </ConfirmMessage>
            <ConfirmActions>
              <ConfirmButton onClick={() => setPendingDelete(null)} disabled={isDeleting}>
                Cancel
              </ConfirmButton>
              <ConfirmButton
                $variant="danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </ConfirmButton>
            </ConfirmActions>
          </ConfirmBody>
        )}
      </Modal>
    </div>
  );
};

export default BusinessesPage;
