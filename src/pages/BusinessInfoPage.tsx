import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { getBusinessInfo, deleteBusinessInfo } from '../api/businessInfoApi';
import Modal from '../components/Modal';
import CreateBusinessInfoForm from '../components/CreateBusinessInfoForm';
import { FiPlus, FiTrash2, FiEdit } from 'react-icons/fi';

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
  gap: 0.4rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  border: none;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.85rem;
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


const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-block;
  padding: 0.18rem 0.45rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.7rem;
  font-weight: 600;
  background-color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.success : theme.colors.muted};
  color: ${({ theme }) => theme.colors.bg};
`;

const ActionsContainer = styled.div`
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.subtle};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  padding: 0.15rem;
  flex-shrink: 0;
  min-width: 1.3rem;
  width: 1.3rem;
  height: 1.3rem;
  box-sizing: border-box;

  svg {
    width: 100%;
    height: 100%;
  }

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
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
      $variant === 'danger' ? theme.colors.dangerBright : theme.colors.border};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ITEMS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type BusinessInfoRow = {
  id: string;
  title: string;
  business: string;
  summaryStats: string;
  grandPrizeTitle: string;
  grandPrizeDescription: string;
  drawDate: string;
  entryRule: string;
  earnPerPurchase: string;
  isActive: boolean;
  createdAt: string;
};

const BusinessInfoPage = () => {
  const [businessInfo, setBusinessInfo] = useState<BusinessInfoRow[]>([]);
  const [rawBusinessInfoData, setRawBusinessInfoData] = useState<
    Map<string, import('../api/businessInfoApi').BusinessInfoRecord>
  >(new Map());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBusinessInfo, setEditingBusinessInfo] = useState<BusinessInfoRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<BusinessInfoRow | null>(null);
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
    setIsLoading(true);

    const fetchBusinessInfo = async () => {
      try {
        const response = await getBusinessInfo({
          page: 1,
          limit: 1000, // Fetch all for client-side pagination and search
        });

        if (isCancelled) return;

        if (!response.success) {
          toast.error(response.message);
          setBusinessInfo([]);
          setTotalPages(1);
          setIsLoading(false);
          return;
        }

        // Store raw data for editing
        const rawDataMap = new Map<string, import('../api/businessInfoApi').BusinessInfoRecord>();
        response.data.forEach((info) => {
          if (info._id) {
            rawDataMap.set(info._id, info);
          }
        });
        setRawBusinessInfoData(rawDataMap);

        const normalizedBusinessInfo: BusinessInfoRow[] = response.data.map((info) => {
          // Format summary stats as a string
          const statsSummary = info.summaryStats
            .map((stat) => `${stat.label}: ${stat.value}`)
            .join(', ');

          // Format earn per purchase with all important data
          const earnPerPurchaseSummary = info.earnPerPurchase
            ?.map((item) => {
              const parts = [
                item.productName,
                item.size ? `(${item.size})` : '',
                `${item.points}pts`,
                `${item.entries} entry${item.entries !== 1 ? 's' : ''}`,
              ].filter(Boolean);
              return parts.join(', ');
            })
            .join(' | ') || '—';

          return {
            id: info._id ?? '—',
            title: info.title ?? '—',
            business: info.business ?? '—',
            summaryStats: statsSummary || '—',
            grandPrizeTitle: info.grandPrize?.title ?? '—',
            grandPrizeDescription: info.grandPrize?.description ?? '—',
            drawDate: info.grandPrize?.drawDate ?? '—',
            entryRule: info.grandPrize?.entryRule ?? '—',
            earnPerPurchase: earnPerPurchaseSummary,
            isActive: info.isActive ?? false,
            createdAt: info.createdAt
              ? new Date(info.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '—',
          };
        });

        setBusinessInfo(normalizedBusinessInfo);
        setIsLoading(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch business info:', error);
          toast.error('Unexpected error while fetching business info.');
          setBusinessInfo([]);
          setTotalPages(1);
          setIsLoading(false);
        }
      }
    };

    fetchBusinessInfo().catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch business info:', error);
        toast.error('Unexpected error while fetching business info.');
        setBusinessInfo([]);
        setTotalPages(1);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [refreshVersion]);

  const filteredBusinessInfo = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return businessInfo;
    }

    const searchLower = debouncedSearch.toLowerCase();
    return businessInfo.filter(
      (info) =>
        info.title.toLowerCase().includes(searchLower) ||
        info.business.toLowerCase().includes(searchLower) ||
        info.summaryStats.toLowerCase().includes(searchLower) ||
        info.grandPrizeTitle.toLowerCase().includes(searchLower) ||
        info.grandPrizeDescription.toLowerCase().includes(searchLower) ||
        info.drawDate.toLowerCase().includes(searchLower) ||
        info.entryRule.toLowerCase().includes(searchLower) ||
        info.earnPerPurchase.toLowerCase().includes(searchLower) ||
        (info.isActive ? 'active' : 'inactive').includes(searchLower),
    );
  }, [businessInfo, debouncedSearch]);

  const totalFilteredPages = Math.ceil(filteredBusinessInfo.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setTotalPages(totalFilteredPages);
    if (currentPage > totalFilteredPages && totalFilteredPages > 0) {
      setCurrentPage(1);
    }
  }, [totalFilteredPages, currentPage]);

  const paginatedBusinessInfo = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
    return filteredBusinessInfo.slice(firstPageIndex, lastPageIndex);
  }, [filteredBusinessInfo, currentPage]);

  const handleEdit = useCallback((info: BusinessInfoRow) => {
    setModalMode('edit');
    setEditingBusinessInfo(info);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback((info: BusinessInfoRow) => {
    setPendingDelete(info);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const response = await deleteBusinessInfo(pendingDelete.id);
    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete business info.');
      setIsDeleting(false);
      return;
    }

    toast.success(response.message ?? 'Business info deleted successfully.');
    setIsDeleting(false);
    setPendingDelete(null);
    setCurrentPage(1);
    setRefreshVersion((prev) => prev + 1);
  }, [pendingDelete]);

  const columns = useMemo(
    () =>
      [
        { key: 'title', header: 'Title' },
        { key: 'business', header: 'Business ID' },
        {
          key: 'summaryStats',
          header: 'Summary Stats',
          render: (info: BusinessInfoRow) => (
            <div style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>{info.summaryStats}</div>
          ),
        },
        {
          key: 'grandPrize',
          header: 'Grand Prize',
          render: (info: BusinessInfoRow) => (
            <div style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>{info.grandPrizeTitle}</div>
              {info.grandPrizeDescription !== '—' && (
                <div style={{ color: '#888', marginTop: '0.2rem', fontSize: '0.65rem' }}>
                  {info.grandPrizeDescription}
                </div>
              )}
              {info.drawDate !== '—' && (
                <div style={{ color: '#888', marginTop: '0.2rem', fontSize: '0.65rem' }}>
                  Draw: {info.drawDate}
                </div>
              )}
              {info.entryRule !== '—' && (
                <div style={{ color: '#888', marginTop: '0.2rem', fontSize: '0.65rem' }}>
                  {info.entryRule}
                </div>
              )}
            </div>
          ),
        },
        {
          key: 'earnPerPurchase',
          header: 'Earn Per Purchase',
          render: (info: BusinessInfoRow) => {
            if (info.earnPerPurchase === '—') {
              return <span>—</span>;
            }
            const items = info.earnPerPurchase.split(' | ');
            return (
              <div style={{ fontSize: '0.7rem', lineHeight: '1.5' }}>
                {items.map((item, idx) => (
                  <div key={idx} style={{ marginBottom: idx < items.length - 1 ? '0.3rem' : '0' }}>
                    {item}
                  </div>
                ))}
              </div>
            );
          },
        },
        {
          key: 'status',
          header: 'Status',
          render: (info: BusinessInfoRow) => (
            <StatusBadge $isActive={info.isActive}>
              {info.isActive ? 'Active' : 'Inactive'}
            </StatusBadge>
          ),
        },
        { key: 'createdAt', header: 'Created' },
        {
          key: 'actions',
          header: 'Actions',
          render: (info: BusinessInfoRow) => (
            <ActionsContainer>
              <ActionButton title="Edit business info" onClick={() => handleEdit(info)}>
                <FiEdit />
              </ActionButton>
              <ActionButton title="Delete business info" onClick={() => handleDelete(info)}>
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
        <Title>BusinessInfo</Title>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <CreateButton
            onClick={() => {
              setModalMode('create');
              setEditingBusinessInfo(null);
              setIsModalOpen(true);
            }}
          >
            <FiPlus /> Create
          </CreateButton>
        </div>
      </Header>

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={8} />
      ) : paginatedBusinessInfo.length === 0 ? (
        <EmptyState>
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No business info found</p>
            <p style={{ fontSize: '0.9rem' }}>
              {debouncedSearch.trim()
                ? 'Try adjusting your search criteria.'
                : 'There are no business info to display.'}
            </p>
          </div>
        </EmptyState>
      ) : (
        <>
          <Table columns={columns} data={paginatedBusinessInfo} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateBusinessInfoForm
          mode={modalMode}
          initialValues={
            modalMode === 'edit' && editingBusinessInfo
              ? (() => {
                  const rawData = rawBusinessInfoData.get(editingBusinessInfo.id);
                  if (!rawData) return undefined;
                  return {
                    id: rawData._id,
                    business: rawData.business,
                    title: rawData.title,
                    summaryStats: rawData.summaryStats.map((stat) => ({
                      label: stat.label,
                      value: stat.value,
                    })),
                    grandPrize: rawData.grandPrize
                      ? {
                          title: rawData.grandPrize.title,
                          description: rawData.grandPrize.description,
                          drawDate: rawData.grandPrize.drawDate,
                          entryRule: rawData.grandPrize.entryRule,
                        }
                      : undefined,
                    earnPerPurchase: rawData.earnPerPurchase?.map((item) => ({
                      productName: item.productName,
                      size: item.size,
                      points: item.points,
                      entries: item.entries,
                      bonusTip: item.bonusTip,
                    })),
                    isActive: rawData.isActive,
                  };
                })()
              : undefined
          }
          onCreated={() => {
            setRefreshVersion((prev) => prev + 1);
            setCurrentPage(1);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingBusinessInfo(null);
          }}
        />
      </Modal>

      <Modal isOpen={Boolean(pendingDelete)} onClose={() => (isDeleting ? undefined : setPendingDelete(null))}>
        {pendingDelete && (
          <ConfirmBody>
            <ConfirmTitle>Delete {pendingDelete.title}?</ConfirmTitle>
            <ConfirmMessage>
              This action will permanently remove the business info from the system.
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

export default BusinessInfoPage;

