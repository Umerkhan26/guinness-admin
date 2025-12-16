import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
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
    if ($actionType === 'receipt_upload') return theme.colors.warning;
    return theme.colors.muted;
  }};
  color: ${({ theme }) => theme.colors.bg};
`;

const ViewDetailsButton = styled.button`
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

const DetailsModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-right: 1rem;
`;

const DetailsTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const DetailsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.cardAlt};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.muted};
    }
  }
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.subtle};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const DetailValue = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  word-break: break-word;
  line-height: 1.5;
`;

const DetailLink = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: underline;
  font-size: 1rem;
  word-break: break-all;
  line-height: 1.5;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryBright};
  }
`;

const ITEMS_PER_PAGE = 100;
const SEARCH_DEBOUNCE_MS = 400;

type HistoryRow = {
  id: string;
  userId: string;
  session: string;
  relatedBusiness: string;
  actionType: string;
  points: number;
  details: string;
  detailsObject?: Record<string, any>; // Store parsed details for rendering
  timestamp: string;
};

type ActionTypeFilter = 'all' | 'qr_code_create' | 'qr_scan' | 'receipt_upload';

const HistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [activeActionFilter, setActiveActionFilter] = useState<ActionTypeFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDetails, setSelectedDetails] = useState<Record<string, any> | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

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

  // Handle details click to open modal
  const handleDetailsClick = (detailsObj: Record<string, any> | undefined) => {
    if (!detailsObj || Object.keys(detailsObj).length === 0) {
      toast.error('No details available.');
      return;
    }
    setSelectedDetails(detailsObj);
    setIsDetailsModalOpen(true);
  };

  // Format key names for display
  const formatKeyName = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };


  // Helper function to normalize history data
  const normalizeHistory = (items: any[]): HistoryRow[] => {
    return items.map((item) => {
      // Format details as a readable string
      let detailsStr = '—';
      let detailsObj: Record<string, any> | undefined = undefined;
      
      if (item.details) {
        if (typeof item.details === 'string') {
          // Try to parse as JSON string
          try {
            const parsed = JSON.parse(item.details);
            if (typeof parsed === 'object' && parsed !== null) {
              detailsObj = parsed;
              // Format as readable key-value pairs
              const formatted = Object.entries(parsed)
                .map(([key, value]) => {
                  // Format key names (camelCase to Title Case)
                  const formattedKey = key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())
                    .trim();
                  
                  // Format values
                  let formattedValue = String(value);
                  if (key === 'imageUrl' && typeof value === 'string') {
                    formattedValue = 'View Image';
                  } else if (typeof value === 'number') {
                    formattedValue = String(value);
                  }
                  
                  return `${formattedKey}: ${formattedValue}`;
                })
                .join(' • ');
              detailsStr = formatted;
            } else {
              detailsStr = item.details;
            }
          } catch {
            // If parsing fails, use the string as-is
            detailsStr = item.details;
          }
        } else if (typeof item.details === 'object' && item.details !== null) {
          detailsObj = item.details;
          detailsStr = Object.entries(item.details)
            .map(([key, value]) => {
              const formattedKey = key
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();
              return `${formattedKey}: ${value}`;
            })
            .join(' • ');
        }
      }

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
        detailsObject: detailsObj,
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

  // Reset to page 1 when search or action filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeActionFilter]);

  // Fetch history data from backend with filtering and pagination
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchHistory = async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sortBy: 'timestamp',
          sortOrder: 'desc',
        };

        // Add actionType filter if not 'all'
        if (activeActionFilter !== 'all') {
          params.actionType = activeActionFilter;
        }

        // Add search if provided
        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const response = await getHistory(params);

        if (isCancelled) return;

        if (!response.success) {
          toast.error(response.message || 'Failed to fetch history.');
          setHistory([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }

        setHistory(normalizeHistory(response.data.data));
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.total);
        setIsLoading(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch history:', error);
          toast.error('Unexpected error while fetching history.');
          setHistory([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
        }
      }
    };

    fetchHistory().catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch history:', error);
        toast.error('Unexpected error while fetching history.');
        setHistory([]);
        setTotalPages(1);
        setTotalCount(0);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, activeActionFilter, debouncedSearch]);

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
          render: (item: HistoryRow) => {
            if (!item.detailsObject || Object.keys(item.detailsObject).length === 0) {
              return <span>—</span>;
            }

            return (
              <ViewDetailsButton
                type="button"
                onClick={() => handleDetailsClick(item.detailsObject)}
                title="Click to view details"
              >
                View Details
              </ViewDetailsButton>
            );
          },
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
        <SubTabButton
          type="button"
          $active={activeActionFilter === 'receipt_upload'}
          onClick={() => {
            setActiveActionFilter('receipt_upload');
            setCurrentPage(1);
          }}
        >
          Receipt Upload
        </SubTabButton>
      </SubTabsContainer>
      <SearchInput
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search history..."
      />

      {isLoading ? (
        <TableSkeleton columns={columns.length} rows={8} />
      ) : history.length === 0 ? (
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
          <Table columns={columns} data={history} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <SummaryText>
            {isLoading
              ? 'Fetching history...'
              : `Showing page ${Math.min(currentPage, totalPages || 1)} of ${totalPages || 1}. ${
                  activeActionFilter !== 'all' ? `${activeActionFilter.replace(/_/g, ' ')} - ` : ''
                }Total history: ${totalCount}.`}
          </SummaryText>
        </>
      )}
      <Modal 
        isOpen={isDetailsModalOpen} 
        onClose={() => setIsDetailsModalOpen(false)}
        maxWidth="600px"
      >
        <DetailsModalContent>
          <DetailsTitle>Receipt Details</DetailsTitle>
          {selectedDetails && (
            <DetailsList>
              {Object.entries(selectedDetails).map(([key, value]) => {
                const formattedKey = formatKeyName(key);
                
                if (key === 'imageUrl' && typeof value === 'string') {
                  return (
                    <DetailItem key={key}>
                      <DetailLabel>{formattedKey}</DetailLabel>
                      <DetailLink 
                        href={value} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {value}
                      </DetailLink>
                    </DetailItem>
                  );
                }
                
                return (
                  <DetailItem key={key}>
                    <DetailLabel>{formattedKey}</DetailLabel>
                    <DetailValue>{String(value)}</DetailValue>
                  </DetailItem>
                );
              })}
            </DetailsList>
          )}
        </DetailsModalContent>
      </Modal>
    </div>
  );
};

export default HistoryPage;

