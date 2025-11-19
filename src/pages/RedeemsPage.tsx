import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { getRedeems, updateRedeemStatus } from '../api/redeemsApi';
import { FiCheck, FiClock } from 'react-icons/fi';

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

const SummaryText = styled.div`
  margin-top: 1rem;
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 0.85rem;
`;


const StatusBadge = styled.span<{ $status: string }>`
  display: inline-block;
  padding: 0.18rem 0.45rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${({ theme, $status }) => {
    if ($status === 'delivered') return theme.colors.success;
    if ($status === 'pending') return theme.colors.warning;
    if ($status === 'approved') return theme.colors.success;
    if ($status === 'rejected') return theme.colors.danger;
    return theme.colors.muted;
  }};
  color: ${({ theme }) => theme.colors.bg};
`;

const ActionsContainer = styled.div`
  display: inline-flex;
  gap: 0.4rem;
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
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.subtle};
  padding: 0.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radii.sm};
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.primarySoft};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ITEMS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type RedeemRow = {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  rewardName: string;
  businessName: string;
  rewardType: string;
  pointsRequired: number;
  pointsUsed: number;
  redeemCode: string;
  status: string;
  createdAt: string;
};

const RedeemsPage = () => {
  const [redeems, setRedeems] = useState<RedeemRow[]>([]);
  const [allRedeems, setAllRedeems] = useState<RedeemRow[]>([]); // For business filter tabs
  const [activeBusinessFilter, setActiveBusinessFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<Set<string>>(new Set());
  
  // Ref to prevent duplicate calls for tabs in React StrictMode
  const tabsFetchedRef = useRef(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  // Fetch all redeems once to populate business filter tabs
  useEffect(() => {
    // Prevent duplicate calls in React StrictMode
    if (tabsFetchedRef.current) return;
    tabsFetchedRef.current = true;

    let isCancelled = false;

    const fetchAllForTabs = async () => {
      try {
        const response = await getRedeems({
          page: 1,
          limit: 15, // Fetch first page to get business names for tabs
        });

        if (isCancelled) return;

        if (response.success) {
          const normalizedRedeems: RedeemRow[] = response.data.map((redeem) => ({
            id: redeem._id ?? '—',
            userName: redeem.user
              ? `${redeem.user.firstName ?? ''} ${redeem.user.lastName ?? ''}`.trim() || redeem.user.email || '—'
              : '—',
            userEmail: redeem.user?.email ?? '—',
            userPhone: redeem.user?.phone ?? '—',
            rewardName: redeem.reward?.rewardName ?? '—',
            businessName: redeem.reward?.business?.name ?? '—',
            rewardType: redeem.reward?.rewardType ?? '—',
            pointsRequired: redeem.reward?.pointsRequired ?? 0,
            pointsUsed: redeem.pointsUsed ?? 0,
            redeemCode: redeem.redeemCode ?? '—',
            status: redeem.status ?? '—',
            createdAt: redeem.createdAt
              ? new Date(redeem.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              : '—',
          }));
          setAllRedeems(normalizedRedeems);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch redeems for tabs:', error);
        }
      }
    };

    fetchAllForTabs();
    return () => {
      isCancelled = true;
    };
  }, []);

  // Fetch paginated redeems from server
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchRedeems = async () => {
      try {
        const response = await getRedeems({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        });

        if (isCancelled) return;

        if (!response.success) {
          toast.error(response.message);
          setRedeems([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }

        const normalizedRedeems: RedeemRow[] = response.data.map((redeem) => ({
          id: redeem._id ?? '—',
          userName: redeem.user
            ? `${redeem.user.firstName ?? ''} ${redeem.user.lastName ?? ''}`.trim() || redeem.user.email || '—'
            : '—',
          userEmail: redeem.user?.email ?? '—',
          userPhone: redeem.user?.phone ?? '—',
          rewardName: redeem.reward?.rewardName ?? '—',
          businessName: redeem.reward?.business?.name ?? '—',
          rewardType: redeem.reward?.rewardType ?? '—',
          pointsRequired: redeem.reward?.pointsRequired ?? 0,
          pointsUsed: redeem.pointsUsed ?? 0,
          redeemCode: redeem.redeemCode ?? '—',
          status: redeem.status ?? '—',
          createdAt: redeem.createdAt
            ? new Date(redeem.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })
            : '—',
        }));

        setRedeems(normalizedRedeems);
        setTotalPages(response.pagination?.totalPages ?? 1);
        setTotalCount(response.pagination?.total ?? 0);
        setIsLoading(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch redeems:', error);
          toast.error('Unexpected error while fetching redeems.');
          setRedeems([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
        }
      }
    };

    fetchRedeems().catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch redeems:', error);
        toast.error('Unexpected error while fetching redeems.');
        setRedeems([]);
        setTotalPages(1);
        setTotalCount(0);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, refreshVersion]);

  // Filter current page's redeems by business and search (client-side filtering on current page only)
  const filteredRedeems = useMemo(() => {
    let filtered = redeems;

    // Filter by business
    if (activeBusinessFilter !== 'all') {
      filtered = filtered.filter((redeem) => redeem.businessName === activeBusinessFilter);
    }

    // Filter by search
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (redeem) =>
          redeem.userName.toLowerCase().includes(searchLower) ||
          redeem.userEmail.toLowerCase().includes(searchLower) ||
          redeem.userPhone.toLowerCase().includes(searchLower) ||
          redeem.rewardName.toLowerCase().includes(searchLower) ||
          redeem.businessName.toLowerCase().includes(searchLower) ||
          redeem.rewardType.toLowerCase().includes(searchLower) ||
          redeem.redeemCode.toLowerCase().includes(searchLower) ||
          String(redeem.pointsUsed).includes(searchLower) ||
          String(redeem.pointsRequired).includes(searchLower) ||
          redeem.status.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [redeems, activeBusinessFilter, debouncedSearch]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    if (activeBusinessFilter !== 'all' || debouncedSearch.trim()) {
      setCurrentPage(1);
    }
  }, [activeBusinessFilter, debouncedSearch]);

  const handleToggleStatus = useCallback(async (redeem: RedeemRow) => {
    if (!redeem.id || redeem.id === '—') {
      toast.error('Unable to update status: redeem identifier missing.');
      return;
    }

    const currentStatus = redeem.status.toLowerCase();
    const nextStatus = currentStatus === 'pending' ? 'delivered' : 'pending';

    setUpdatingStatus((prev) => new Set(prev).add(redeem.id));

    try {
      const result = await updateRedeemStatus({
        redeemId: redeem.id,
        status: nextStatus as 'pending' | 'delivered',
      });

      if (!result.success) {
        toast.error(result.message || 'Failed to update redeem status.');
        return;
      }

      toast.success(result.message || 'Redeem status updated successfully.');

      // Update the local state
      setRedeems((prev) =>
        prev.map((r) =>
          r.id === redeem.id
            ? { ...r, status: nextStatus }
            : r
        )
      );

      // Refresh data to ensure consistency
      setRefreshVersion((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to update redeem status:', error);
      toast.error('Unexpected error while updating redeem status.');
    } finally {
      setUpdatingStatus((prev) => {
        const next = new Set(prev);
        next.delete(redeem.id);
        return next;
      });
    }
  }, []);

  const columns = useMemo(
    () =>
      [
        {
          key: 'userName',
          header: 'User',
          render: (redeem: RedeemRow) => (
            <div>
              <div>{redeem.userName}</div>
              <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.2rem' }}>
                {redeem.userEmail}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '0.1rem' }}>
                {redeem.userPhone}
              </div>
            </div>
          ),
        },
        {
          key: 'rewardName',
          header: 'Reward',
          render: (redeem: RedeemRow) => (
            <div>
              <div>{redeem.rewardName}</div>
              <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.2rem' }}>
                {redeem.businessName}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '0.1rem' }}>
                Type: {redeem.rewardType}
              </div>
            </div>
          ),
        },
        {
          key: 'points',
          header: 'Points',
          render: (redeem: RedeemRow) => (
            <div>
              <div>Used: {redeem.pointsUsed}</div>
              <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.2rem' }}>
                Required: {redeem.pointsRequired}
              </div>
            </div>
          ),
        },
        { 
          key: 'redeemCode', 
          header: 'Redeem Code',
          render: (redeem: RedeemRow) => (
            <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#F59E0B' }}>
              {redeem.redeemCode}
            </div>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (redeem: RedeemRow) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <StatusBadge $status={redeem.status}>{redeem.status}</StatusBadge>
            </div>
          ),
        },
        {
          key: 'actions',
          header: 'Actions',
          render: (redeem: RedeemRow) => {
            const isUpdating = updatingStatus.has(redeem.id);
            const currentStatus = redeem.status.toLowerCase();
            const canToggle = currentStatus === 'pending' || currentStatus === 'delivered';

            return (
              <ActionsContainer>
                {canToggle && (
                  <ActionButton
                    title={
                      currentStatus === 'pending'
                        ? 'Mark as delivered'
                        : 'Mark as pending'
                    }
                    onClick={() => handleToggleStatus(redeem)}
                    disabled={isUpdating}
                  >
                    {currentStatus === 'pending' ? (
                      <FiCheck style={{ fontSize: '1rem' }} />
                    ) : (
                      <FiClock style={{ fontSize: '1rem' }} />
                    )}
                  </ActionButton>
                )}
              </ActionsContainer>
            );
          },
        },
        { key: 'createdAt', header: 'Created' },
      ],
    [handleToggleStatus, updatingStatus],
  );

  // Get unique business names for tabs - show all business types from enum, plus any that exist in data
  const businessNames = useMemo(() => {
    const businessTypes = ['Supermarket', 'Rumshop/Small Store', 'Wholesaler', 'Bar/Restaurant'];
    const uniqueFromData = Array.from(new Set(allRedeems.map((r) => r.businessName))).filter(
      (name) => name !== 'Unknown Business' && name !== 'No Business' && name !== '—'
    );
    
    // Combine enum types with any additional types found in data
    const allBusinesses = new Set([...businessTypes, ...uniqueFromData]);
    return Array.from(allBusinesses).sort();
  }, [allRedeems]);

  return (
    <div>
      <Header>
        <Title>Redeems</Title>
      </Header>
      <TabsContainer>
        <TabButton
          type="button"
          $active={activeBusinessFilter === 'all'}
          onClick={() => {
            setActiveBusinessFilter('all');
            setCurrentPage(1);
          }}
        >
          All
        </TabButton>
        {businessNames.map((businessName) => (
          <TabButton
            key={businessName}
            type="button"
            $active={activeBusinessFilter === businessName}
            onClick={() => {
              setActiveBusinessFilter(businessName);
              setCurrentPage(1);
            }}
          >
            {businessName}
          </TabButton>
        ))}
      </TabsContainer>
      <SearchInput value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={8} />
      ) : filteredRedeems.length === 0 ? (
        <EmptyState>
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>No redeems found</p>
            <p style={{ fontSize: '0.9rem' }}>
              {debouncedSearch.trim()
                ? 'Try adjusting your search criteria.'
                : 'There are no redeems to display.'}
            </p>
          </div>
        </EmptyState>
            ) : (
              <>
                <Table columns={columns} data={filteredRedeems} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <SummaryText>
                  {isLoading
                    ? 'Fetching redeems...'
                    : `Showing page ${Math.min(currentPage, totalPages || 1)} of ${totalPages || 1}. Total redeems: ${totalCount}.`}
                </SummaryText>
              </>
            )}
    </div>
  );
};

export default RedeemsPage;

