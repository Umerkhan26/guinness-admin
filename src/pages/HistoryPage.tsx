import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import { getHistory } from '../api/historyApi';

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
  margin-bottom: 1rem;
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

const SubTabsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  margin-left: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  flex-wrap: wrap;
`;

const SubTabButton = styled.button<{ $active: boolean }>`
  padding: 0.4rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.primary : 'transparent'};
  color: ${({ theme, $active }) => ($active ? theme.colors.bg : theme.colors.subtle)};
  font-weight: 500;
  font-size: 0.9rem;
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

const UserIdLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryBright};
  }
`;

const BusinessIdLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
  font-size: inherit;
  padding: 0;
  font-weight: 500;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryBright};
  }
`;


const ActionTypeBadge = styled.span<{ $actionType: string }>`
  display: inline-block;
  padding: 0.18rem 0.45rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${({ theme, $actionType }) => {
    if ($actionType === 'qr_code_create') return theme.colors.success;
    if ($actionType === 'qr_scan') return theme.colors.primary;
    return theme.colors.muted;
  }};
  color: ${({ theme }) => theme.colors.bg};
`;

const ITEMS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 400;

type HistoryRow = {
  id: string;
  userId: string;
  session: string;
  relatedBusiness: string;
  actionType: string;
  points: number;
  details: string;
  timestamp: string;
};

type ActionTypeFilter = 'all' | 'qr_code_create' | 'qr_scan';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [allHistory, setAllHistory] = useState<HistoryRow[]>([]);
  const [activeActionFilter, setActiveActionFilter] = useState<ActionTypeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  // Navigate to user details page when a user ID is clicked
  const handleUserIdClick = (userId: string) => {
    if (!userId || userId === '—') {
      toast.error('Invalid user ID.');
      return;
    }

    navigate(`/user-details/${userId}`);
  };

  // Navigate to business details page when a business ID is clicked
  const handleBusinessIdClick = (businessId: string) => {
    if (!businessId || businessId === '—') {
      toast.error('Invalid business ID.');
      return;
    }

    navigate(`/business-details/${businessId}`);
  };


  // Helper function to normalize history data
  const normalizeHistory = (items: any[]): HistoryRow[] => {
    return items.map((item) => {
      // Format details as a readable string
      const detailsStr = item.details
        ? Object.entries(item.details)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
        : '—';

      // Extract user ID (can be string or object)
      let userId = '—';
      if (item.user) {
        if (typeof item.user === 'string') {
          userId = item.user;
        } else if (typeof item.user === 'object' && item.user !== null && item.user._id) {
          userId = item.user._id;
        }
      }

      // Extract related business ID (can be string or object)
      let relatedBusiness = '—';
      if (item.relatedBusiness) {
        if (typeof item.relatedBusiness === 'string') {
          relatedBusiness = item.relatedBusiness;
        } else if (typeof item.relatedBusiness === 'object' && item.relatedBusiness !== null) {
          relatedBusiness = item.relatedBusiness._id ?? '—';
        }
      }

      return {
        id: item._id ?? '—',
        userId,
        session: item.session ?? '—',
        relatedBusiness,
        actionType: item.actionType ?? '—',
        points: item.points ?? 0,
        details: detailsStr,
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
      };
    });
  };

  // Fetch all history data for filtering (fetch large batch)
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchAllHistory = async () => {
      try {
        // Fetch a large batch to enable proper client-side filtering
        const response = await getHistory({
          page: 1,
          limit: 1000,
          sortBy: 'timestamp',
          sortOrder: 'desc',
        });

        if (isCancelled) return;

        if (!response.success) {
          toast.error(response.message || 'Failed to fetch history.');
          setAllHistory([]);
          setIsLoading(false);
          return;
        }

        setAllHistory(normalizeHistory(response.data.data));
        setIsLoading(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch history:', error);
          toast.error('Unexpected error while fetching history.');
          setAllHistory([]);
          setIsLoading(false);
        }
      }
    };

    fetchAllHistory().catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch history:', error);
        toast.error('Unexpected error while fetching history.');
        setAllHistory([]);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, []);


  // Filter history by action type filter and search
  const filteredHistory = useMemo(() => {
    let filtered: HistoryRow[] = allHistory;

    // Filter by action type (sub-tab)
    if (activeActionFilter !== 'all') {
      filtered = filtered.filter((item) => item.actionType === activeActionFilter);
    }

    // Filter by search
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.userId.toLowerCase().includes(searchLower) ||
          item.session.toLowerCase().includes(searchLower) ||
          item.relatedBusiness.toLowerCase().includes(searchLower) ||
          item.actionType.toLowerCase().includes(searchLower) ||
          item.details.toLowerCase().includes(searchLower) ||
          String(item.points).includes(searchLower) ||
          item.timestamp.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [allHistory, activeActionFilter, debouncedSearch]);

  // Reset to page 1 when search or action filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeActionFilter]);

  // Paginate filtered history (client-side pagination)
  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredHistory.slice(startIndex, endIndex);
  }, [filteredHistory, currentPage]);

  const filteredTotalPages = Math.max(Math.ceil(filteredHistory.length / ITEMS_PER_PAGE), 1);

  const columns = useMemo(
    () =>
      [
        {
          key: 'userId',
          header: 'User ID',
          render: (item: HistoryRow) => (
            <UserIdLink
              type="button"
              onClick={() => handleUserIdClick(item.userId)}
              title="Click to view user details"
            >
              {item.userId}
            </UserIdLink>
          ),
        },
        {
          key: 'actionType',
          header: 'Action Type',
          render: (item: HistoryRow) => (
            <ActionTypeBadge $actionType={item.actionType}>
              {item.actionType.replace(/_/g, ' ')}
            </ActionTypeBadge>
          ),
        },
        {
          key: 'points',
          header: 'Points',
        },
        {
          key: 'details',
          header: 'Details',
        },
        {
          key: 'session',
          header: 'Session',
        },
        {
          key: 'relatedBusiness',
          header: 'Related Business',
          render: (item: HistoryRow) => (
            item.relatedBusiness !== '—' ? (
              <BusinessIdLink
                type="button"
                onClick={() => handleBusinessIdClick(item.relatedBusiness)}
                title="Click to view business details"
              >
                {item.relatedBusiness}
              </BusinessIdLink>
            ) : (
              <span>{item.relatedBusiness}</span>
            )
          ),
        },
        {
          key: 'timestamp',
          header: 'Timestamp',
        },
      ],
    [],
  );

  return (
    <div>
      <Header>
        <Title>History</Title>
      </Header>
      <TabsContainer>
        <TabButton
          type="button"
          $active={true}
          onClick={() => {
            setCurrentPage(1);
          }}
        >
          All History
        </TabButton>
      </TabsContainer>
      <SubTabsContainer>
        <SubTabButton
          type="button"
          $active={activeActionFilter === 'all'}
          onClick={() => {
            setActiveActionFilter('all');
            setCurrentPage(1);
          }}
        >
          All
        </SubTabButton>
        <SubTabButton
          type="button"
          $active={activeActionFilter === 'qr_code_create'}
          onClick={() => {
            setActiveActionFilter('qr_code_create');
            setCurrentPage(1);
          }}
        >
          QR Code Create
        </SubTabButton>
        <SubTabButton
          type="button"
          $active={activeActionFilter === 'qr_scan'}
          onClick={() => {
            setActiveActionFilter('qr_scan');
            setCurrentPage(1);
          }}
        >
          QR Scan
        </SubTabButton>
      </SubTabsContainer>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search history..."
      />

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={8} />
      ) : paginatedHistory.length === 0 ? (
        <EmptyState>
          <div>
            <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 600 }}>
              No history found
            </p>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              {debouncedSearch.trim()
                ? 'Try adjusting your search criteria.'
                : activeActionFilter !== 'all'
                  ? `No ${activeActionFilter.replace(/_/g, ' ')} history found.`
                  : 'There is no history to display.'}
            </p>
          </div>
        </EmptyState>
      ) : (
        <>
          <Table columns={columns} data={paginatedHistory} />
          <Pagination
            currentPage={currentPage}
            totalPages={filteredTotalPages}
            onPageChange={setCurrentPage}
          />
          <SummaryText>
            {isLoading
              ? 'Fetching history...'
              : `Showing page ${Math.min(currentPage, filteredTotalPages || 1)} of ${filteredTotalPages || 1}. ${
                  activeActionFilter !== 'all' ? `${activeActionFilter.replace(/_/g, ' ')} - ` : ''
                }Total history: ${filteredHistory.length}.`}
          </SummaryText>
        </>
      )}
    </div>
  );
};

export default HistoryPage;

