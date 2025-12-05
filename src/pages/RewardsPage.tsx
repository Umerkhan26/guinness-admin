import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { getRewards, updateRewardStatus, deleteReward } from '../api/rewardsApi';
import { getBusinesses } from '../api/businessApi';
import Modal from '../components/Modal';
import CreateRewardForm from '../components/CreateRewardForm';
import { FiPlus, FiEdit, FiLock, FiUnlock, FiTrash2 } from 'react-icons/fi';

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

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
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

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme, $active }) =>
      $active ? theme.colors.primaryBright : theme.colors.card};
    color: ${({ theme, $active }) => ($active ? theme.colors.bg : theme.colors.primary)};
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

const RewardImage = styled.img`
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const StatusBadge = styled.span<{ $isActive: boolean }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.radii.full};
  font-size: 0.75rem;
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

type RewardRow = {
  id: string;
  rewardName: string;
  pointsRequired: number;
  rewardType: string;
  image: string;
  status: 'Active' | 'Inactive';
  isActive: boolean;
  business: string;
  businessName: string;
  createdAt: string;
};

const RewardsPage: React.FC = () => {
  const [rewards, setRewards] = useState<RewardRow[]>([]);
  const [allRewards, setAllRewards] = useState<RewardRow[]>([]);
  const [businesses, setBusinesses] = useState<Map<string, string>>(new Map());
  const [activeBusinessFilter, setActiveBusinessFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingReward, setEditingReward] = useState<RewardRow | null>(null);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [pendingDelete, setPendingDelete] = useState<RewardRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Ref to prevent duplicate calls for tabs in React StrictMode
  const tabsFetchedRef = useRef(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  // Fetch businesses to map IDs to names
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await getBusinesses({ page: 1, limit: 100 });
        if (response.success) {
          const businessMap = new Map<string, string>();
          response.data.forEach((business) => {
            businessMap.set(business._id, business.name);
          });
          setBusinesses(businessMap);
        }
      } catch (error) {
        console.error('Failed to fetch businesses:', error);
      }
    };

    fetchBusinesses();
  }, []);

  // Fetch all rewards once to populate business filter tabs (only once on mount)
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (tabsFetchedRef.current) return;
    tabsFetchedRef.current = true;

    let isCancelled = false;

    const fetchAllForTabs = async () => {
      try {
        const response = await getRewards({
          page: 1,
          limit: 15, // Fetch first page to get business names for tabs
        });

        if (isCancelled) return;

        if (response.success) {
          const rows = response.data.map((reward) => {
            // Extract business name from different possible formats
            let businessName = 'No Business';
            let businessId = '—';
            
            if (reward.business) {
              if (typeof reward.business === 'string') {
                businessId = reward.business;
                businessName = businesses.get(reward.business) || 'Unknown Business';
              } else if (typeof reward.business === 'object' && reward.business !== null) {
                businessId = reward.business._id;
                businessName = reward.business.name || 'Unknown Business';
              }
            }

            return {
              id: reward._id ?? '—',
              rewardName: reward.rewardName ?? '—',
              pointsRequired: reward.pointsRequired ?? 0,
              rewardType: reward.rewardType ?? '—',
              image: reward.image ?? '',
              status: reward.isActive ? 'Active' : 'Inactive',
              isActive: Boolean(reward.isActive),
              business: businessId,
              businessName,
              createdAt: reward.createdAt
                ? new Date(reward.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : '—',
            } satisfies RewardRow;
          });
          setAllRewards(rows);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch rewards for tabs:', error);
        }
      }
    };

    // Only fetch once on mount, businesses will be available from the businesses useEffect
    fetchAllForTabs();
    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Fetch paginated rewards from server
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchRewards = async () => {
      try {
        const response = await getRewards({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        if (isCancelled) return;

        if (!response.success) {
          toast.error(response.message || 'Failed to fetch rewards.');
          setRewards([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }

        const rows = response.data.map((reward) => {
          // Extract business name from different possible formats
          let businessName = 'No Business';
          let businessId = '—';
          
          if (reward.business) {
            if (typeof reward.business === 'string') {
              businessId = reward.business;
              businessName = businesses.get(reward.business) || 'Unknown Business';
            } else if (typeof reward.business === 'object' && reward.business !== null) {
              businessId = reward.business._id;
              businessName = reward.business.name || 'Unknown Business';
            }
          }

          return {
            id: reward._id ?? '—',
            rewardName: reward.rewardName ?? '—',
            pointsRequired: reward.pointsRequired ?? 0,
            rewardType: reward.rewardType ?? '—',
            image: reward.image ?? '',
            status: reward.isActive ? 'Active' : 'Inactive',
            isActive: Boolean(reward.isActive),
            business: businessId,
            businessName,
            createdAt: reward.createdAt
              ? new Date(reward.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '—',
          } satisfies RewardRow;
        });

        setRewards(rows);
        setTotalPages(response.pagination?.totalPages ?? 1);
        setTotalCount(response.pagination?.total ?? 0);
        setIsLoading(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch rewards:', error);
          toast.error('Unexpected error while fetching rewards.');
          setRewards([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
        }
      }
    };

    fetchRewards().catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch rewards:', error);
        toast.error('Unexpected error while fetching rewards.');
        setRewards([]);
        setTotalPages(1);
        setTotalCount(0);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, refreshVersion]); // Removed businesses from deps - we use it but don't need to refetch when it changes

  // Filter current page's rewards by business and search (client-side filtering on current page only)
  const filteredRewards = useMemo(() => {
    let filtered = rewards;

    // Filter by business
    if (activeBusinessFilter !== 'all') {
      filtered = filtered.filter((reward) => reward.businessName === activeBusinessFilter);
    }

    // Filter by search
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter((reward) =>
        Object.values(reward).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    return filtered;
  }, [rewards, activeBusinessFilter, debouncedSearch]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (activeBusinessFilter !== 'all' || debouncedSearch.trim()) {
      setCurrentPage(1);
    }
  }, [activeBusinessFilter, debouncedSearch]);

  const handleEdit = (reward: RewardRow) => {
    setModalMode('edit');
    setEditingReward(reward);
    setIsModalOpen(true);
  };

  const handleToggleStatus = useCallback(async (reward: RewardRow) => {
    if (!reward.id || reward.id === '—') {
      toast.error('Unable to update status: reward identifier missing.');
      return;
    }

    const nextStatus = !reward.isActive;

    const result = await updateRewardStatus(reward.id, { isActive: nextStatus });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message ?? `Reward ${nextStatus ? 'activated' : 'deactivated'} successfully.`);
    setRefreshVersion((prev) => prev + 1);
  }, []);

  const handleDelete = useCallback((reward: RewardRow) => {
    setPendingDelete(reward);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    const response = await deleteReward(pendingDelete.id);
    if (!response.success) {
      toast.error(response.message ?? 'Failed to delete reward.');
      setIsDeleting(false);
      return;
    }

    toast.success(response.message ?? 'Reward deleted successfully.');
    setIsDeleting(false);
    setPendingDelete(null);
    setCurrentPage(1);
    setRefreshVersion((prev) => prev + 1);
  }, [pendingDelete]);

  const columns = useMemo(
    () =>
      [
        {
          key: 'image',
          header: 'Image',
          render: (reward: RewardRow) =>
            reward.image ? (
              <RewardImage src={reward.image} alt={reward.rewardName} />
            ) : (
              '—'
            ),
        },
        { key: 'rewardName', header: 'Reward Name' },
        { key: 'pointsRequired', header: 'Points Required' },
        { key: 'rewardType', header: 'Reward Type' },
        {
          key: 'status',
          header: 'Status',
          render: (reward: RewardRow) => (
            <StatusBadge $isActive={reward.isActive}>{reward.status}</StatusBadge>
          ),
        },
        { key: 'createdAt', header: 'Created' },
        {
          key: 'actions',
          header: 'Actions',
          render: (reward: RewardRow) => (
            <ActionsContainer>
              <ActionButton title="Edit reward" onClick={() => handleEdit(reward)}>
                <FiEdit />
              </ActionButton>
              <ActionButton
                title={reward.isActive ? 'Deactivate reward' : 'Activate reward'}
                onClick={() => handleToggleStatus(reward)}
              >
                {reward.isActive ? <FiLock /> : <FiUnlock />}
              </ActionButton>
              <ActionButton title="Delete reward" onClick={() => handleDelete(reward)}>
                <FiTrash2 />
              </ActionButton>
            </ActionsContainer>
          ),
        },
      ],
    [handleEdit, handleToggleStatus, handleDelete],
  );

  // Get business names for tabs - show all business types from enum, plus any that exist in data
  const businessNames = useMemo(() => {
    const businessTypes = ['Supermarket', 'Rumshop/Small Store', 'Wholesaler', 'Bar/Restaurant'];
    const uniqueFromData = Array.from(new Set(allRewards.map((r) => r.businessName))).filter(
      (name) => name !== 'Unknown Business' && name !== 'No Business'
    );
    
    // Combine enum types with any additional types found in data
    const allBusinesses = new Set([...businessTypes, ...uniqueFromData]);
    return Array.from(allBusinesses).sort();
  }, [allRewards]);

  return (
    <div>
      <Header>
        <Title>Rewards</Title>
        <CreateButton
          onClick={() => {
            setModalMode('create');
            setEditingReward(null);
            setIsModalOpen(true);
          }}
        >
          <FiPlus />
          Create Reward
        </CreateButton>
      </Header>
      <TabsContainer>
        <TabButton
          type="button"
          $active={activeBusinessFilter === 'all'}
          onClick={() => setActiveBusinessFilter('all')}
        >
          All
        </TabButton>
        {businessNames.map((businessName) => (
          <TabButton
            key={businessName}
            type="button"
            $active={activeBusinessFilter === businessName}
            onClick={() => setActiveBusinessFilter(businessName)}
          >
            {businessName}
          </TabButton>
        ))}
      </TabsContainer>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search rewards..."
      />
      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={8} />
      ) : filteredRewards.length === 0 ? (
        <EmptyState>
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              No rewards found
            </p>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              {debouncedSearch.trim() || activeBusinessFilter !== 'all'
                ? 'Try adjusting your search criteria or selecting a different business filter.'
                : 'There are no rewards in the system.'}
            </p>
          </div>
        </EmptyState>
      ) : (
        <>
          <Table columns={columns} data={filteredRewards} />
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <SummaryText>
            {isLoading
              ? 'Fetching rewards...'
              : `Showing page ${Math.min(currentPage, totalPages || 1)} of ${totalPages || 1}. ${
                  activeBusinessFilter !== 'all' ? `${activeBusinessFilter} - ` : ''
                }Total rewards: ${totalCount}.`}
          </SummaryText>
        </>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <CreateRewardForm
          mode={modalMode}
          initialValues={
            modalMode === 'edit' && editingReward
              ? {
                  id: editingReward.id,
                  rewardName: editingReward.rewardName,
                  business: editingReward.business,
                  pointsRequired: editingReward.pointsRequired,
                  rewardType: editingReward.rewardType,
                  image: editingReward.image,
                  isActive: editingReward.isActive,
                }
              : undefined
          }
          onCreated={() => {
            setRefreshVersion((prev) => prev + 1);
            // Reset to first page to see updated data
            setCurrentPage(1);
          }}
          onClose={() => {
            setIsModalOpen(false);
            setEditingReward(null);
          }}
        />
      </Modal>

      <Modal isOpen={Boolean(pendingDelete)} onClose={() => (isDeleting ? undefined : setPendingDelete(null))}>
        {pendingDelete && (
          <ConfirmBody>
            <ConfirmTitle>Delete {pendingDelete.rewardName}?</ConfirmTitle>
            <ConfirmMessage>
              This action will permanently remove the reward from the catalog.
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

export default RewardsPage;

