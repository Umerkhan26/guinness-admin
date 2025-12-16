import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { FiEdit } from 'react-icons/fi';
import Table from '../components/Table';
import TableSkeleton from '../components/TableSkeleton';
import Pagination from '../components/Pagination';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';
import { getUploadedReceipts, updateReceiptStatus } from '../api/receiptsApi';

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
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

const BusinessNameLink = styled.button`
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

const StatusBadge = styled.span<{ status: string }>`
  background-color: ${({ theme, status }) => {
    if (status === 'approved') return theme.colors.success;
    if (status === 'pending') return theme.colors.warning;
    if (status === 'rejected') return theme.colors.danger;
    return theme.colors.muted;
  }};
  color: ${({ theme }) => theme.colors.bg};
  padding: 0.18rem 0.45rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: capitalize;
`;

const ImageLink = styled.a`
  display: inline-block;
  text-decoration: none;
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
`;

const StatusUpdateModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StatusUpdateTitle = styled.h3`
  margin: 0;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.subtle};
  font-size: 0.9rem;
`;

const Select = styled.select`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const TextArea = styled.textarea`
  background-color: ${({ theme }) => theme.colors.cardAlt};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primarySoft};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.55rem 1.35rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.border};
  background: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.primary : theme.colors.cardAlt};
  color: ${({ theme, $variant }) =>
    $variant === 'primary' ? theme.colors.bg : theme.colors.subtle};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.primaryBright : theme.colors.card};
    border-color: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.primary : theme.colors.primary};
    color: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.bg : theme.colors.primary};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
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

const ITEMS_PER_PAGE = 100;
const SEARCH_DEBOUNCE_MS = 400;

type ReceiptRow = {
  id: string;
  businessName: string;
  businessType: string;
  businessId: string;
  value: string;
  points: number;
  status: string;
  category: string;
  totalAmount: string;
  caseQuantity: string;
  itemsCount: string;
  imageUrl: string;
  createdAt: string;
};

type CaseTypeFilter = 'all' | 'case_0_25' | 'case_0_5' | 'case_0_75' | 'case_1';

const UploadedReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCaseFilter, setActiveCaseFilter] = useState<CaseTypeFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    isOpen: boolean;
    receipt: ReceiptRow | null;
  }>({ isOpen: false, receipt: null });
  const [updateStatus, setUpdateStatus] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [refreshVersion, setRefreshVersion] = useState(0);

  // Format case type for display
  const formatCaseType = (caseType: CaseTypeFilter): string => {
    if (caseType === 'all') return 'All';
    return caseType.replace('case_', 'Case ').replace('_', '.');
  };

  const handleBusinessClick = (businessId: string) => {
    if (!businessId || businessId === '—') {
      toast.error('Invalid business ID.');
      return;
    }
    navigate(`/business-details/${businessId}`);
  };

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [searchTerm]);

  // Helper function to normalize receipt data
  const normalizeReceipts = (items: any[]): ReceiptRow[] => {
    return items.map((item) => {
      // Extract business info
      let businessName = 'Supermarket'; // Default value
      let businessType = 'Upload Receipt'; // Default value
      let businessId = '—';

      if (item.business) {
        if (typeof item.business === 'string') {
          businessId = item.business;
        } else if (typeof item.business === 'object' && item.business !== null) {
          businessId = item.business._id ?? '—';
          if (item.business.businessInfo) {
            businessName = item.business.businessInfo.businessName || 'Supermarket';
            businessType = item.business.businessInfo.businessType || 'Upload Receipt';
          }
        }
      }

      // Extract meta data
      let totalAmount = '—';
      let caseQuantity = '—';
      let itemsCount = '—';
      let category = '—';
      let imageUrl = '—';

      if (item.meta) {
        // Total amount from meta.totalAmount
        if (item.meta.totalAmount != null) {
          totalAmount = `$${item.meta.totalAmount.toFixed(2)}`;
        }

        // Case quantity from meta.caseQuantity
        if (item.meta.caseQuantity != null) {
          caseQuantity = String(item.meta.caseQuantity);
        }

        // Category from meta.category
        if (item.meta.category) {
          category = item.meta.category.replace(/_/g, ' ');
        }

        // Image URL from meta.imageUrl
        if (item.meta.imageUrl) {
          imageUrl = item.meta.imageUrl;
        }

        // Items count from meta.extractedData array
        if (Array.isArray(item.meta.extractedData)) {
          itemsCount = String(item.meta.extractedData.length);
        }
      }

      return {
        id: item._id ?? '—',
        businessName,
        businessType,
        businessId,
        value: item.value ?? '—',
        points: item.points ?? 0,
        status: item.status ?? '—',
        category,
        totalAmount,
        caseQuantity,
        itemsCount,
        imageUrl,
        createdAt: item.createdAt
          ? new Date(item.createdAt).toLocaleDateString('en-GB', {
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

  // Reset to page 1 when search or case filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, activeCaseFilter]);

  // Fetch receipts from backend with pagination
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchReceipts = async () => {
      try {
        const params: any = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sortBy: 'createdAt',
          sortOrder: 'desc', // Latest first
        };

        // Add caseType filter if not 'all'
        if (activeCaseFilter !== 'all') {
          params.caseType = activeCaseFilter;
        }

        const response = await getUploadedReceipts(params);

        if (isCancelled) return;

        if (!response.success) {
          toast.error(response.message || 'Failed to fetch uploaded receipts.');
          setReceipts([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }

        const normalizedReceipts = normalizeReceipts(response.data.data);

        // Client-side search filtering (only for display, pagination is from backend)
        const filteredReceipts = debouncedSearch.trim()
          ? normalizedReceipts.filter((receipt) => {
              const searchLower = debouncedSearch.toLowerCase();
              return (
                receipt.businessName.toLowerCase().includes(searchLower) ||
                receipt.businessType.toLowerCase().includes(searchLower) ||
                receipt.businessId.toLowerCase().includes(searchLower) ||
                receipt.value.toLowerCase().includes(searchLower) ||
                receipt.status.toLowerCase().includes(searchLower) ||
                receipt.category.toLowerCase().includes(searchLower) ||
                String(receipt.points).includes(searchLower) ||
                receipt.totalAmount.toLowerCase().includes(searchLower) ||
                receipt.caseQuantity.includes(searchLower) ||
                receipt.itemsCount.includes(searchLower) ||
                receipt.createdAt.toLowerCase().includes(searchLower)
              );
            })
          : normalizedReceipts;

        setReceipts(filteredReceipts);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.total);
        setIsLoading(false);
      } catch (error) {
        if (!isCancelled) {
          console.error('Failed to fetch receipts:', error);
          toast.error('Unexpected error while fetching receipts.');
          setReceipts([]);
          setTotalPages(1);
          setTotalCount(0);
          setIsLoading(false);
        }
      }
    };

    fetchReceipts().catch((error) => {
      if (!isCancelled) {
        console.error('Failed to fetch receipts:', error);
        toast.error('Unexpected error while fetching receipts.');
        setReceipts([]);
        setTotalPages(1);
        setTotalCount(0);
        setIsLoading(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [currentPage, debouncedSearch, activeCaseFilter, refreshVersion]);

  const handleStatusUpdateClick = (receipt: ReceiptRow) => {
    setStatusUpdateModal({ isOpen: true, receipt });
    setUpdateStatus(receipt.status as 'approved' | 'pending' | 'rejected' || 'pending');
    setAdminNotes('');
  };

  const handleStatusUpdate = async () => {
    if (!statusUpdateModal.receipt) return;

    setIsUpdating(true);
    const result = await updateReceiptStatus({
      sessionId: statusUpdateModal.receipt.id,
      status: updateStatus,
      adminNotes: adminNotes.trim() || undefined,
    });

    setIsUpdating(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    // Check if the message indicates userId was missing
    const isUserIdMissing = result.message.toLowerCase().includes('userid missing') || 
                           result.message.toLowerCase().includes('userId missing');

    // Show success message, with warning if userId was missing
    if (isUserIdMissing) {
      toast(result.message, {
        duration: 6000,
        icon: '⚠️',
        style: {
          background: '#f59e0b',
          color: '#000000',
          fontWeight: 600,
        },
      });
    } else {
      toast.success(result.message);
    }

    setStatusUpdateModal({ isOpen: false, receipt: null });
    setAdminNotes('');
    setRefreshVersion((prev) => prev + 1);
  };

  const columns = useMemo(
    () => [
      {
        key: 'businessName',
        header: 'Business Name',
        render: (receipt: ReceiptRow) => (
          receipt.businessId !== '—' ? (
            <BusinessNameLink
              type="button"
              onClick={() => handleBusinessClick(receipt.businessId)}
              title="Click to view business details"
            >
              {receipt.businessName}
            </BusinessNameLink>
          ) : (
            <span>{receipt.businessName}</span>
          )
        ),
      },
      { key: 'businessType', header: 'Business Type' },
      { key: 'category', header: 'Category' },
      { key: 'points', header: 'Points' },
      { key: 'totalAmount', header: 'Total Amount' },
      { key: 'caseQuantity', header: 'Case Quantity' },
      {
        key: 'status',
        header: 'Status',
        render: (receipt: ReceiptRow) => (
          <StatusBadge status={receipt.status}>{receipt.status}</StatusBadge>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (receipt: ReceiptRow) => (
          <ActionsContainer>
            <ActionButton
              title="Update status"
              onClick={() => handleStatusUpdateClick(receipt)}
            >
              <FiEdit />
            </ActionButton>
          </ActionsContainer>
        ),
      },
      {
        key: 'receiptImage',
        header: 'Receipt Image',
        render: (receipt: ReceiptRow) => (
          receipt.imageUrl !== '—' ? (
            <ImageLink
              href={receipt.imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Click to view receipt image"
            >
              Receipt Image
            </ImageLink>
          ) : (
            <span>—</span>
          )
        ),
      },
      { key: 'createdAt', header: 'Uploaded At' },
    ],
    [],
  );

  return (
    <PageLayout>
      <HeaderStack>
        <Title>Uploaded Receipts</Title>
        <TabsContainer>
          <TabButton
            type="button"
            $active={activeCaseFilter === 'all'}
            onClick={() => {
              setActiveCaseFilter('all');
              setCurrentPage(1);
            }}
          >
            All
          </TabButton>
          <TabButton
            type="button"
            $active={activeCaseFilter === 'case_0_25'}
            onClick={() => {
              setActiveCaseFilter('case_0_25');
              setCurrentPage(1);
            }}
          >
            Case 0.25
          </TabButton>
          <TabButton
            type="button"
            $active={activeCaseFilter === 'case_0_5'}
            onClick={() => {
              setActiveCaseFilter('case_0_5');
              setCurrentPage(1);
            }}
          >
            Case 0.5
          </TabButton>
          <TabButton
            type="button"
            $active={activeCaseFilter === 'case_0_75'}
            onClick={() => {
              setActiveCaseFilter('case_0_75');
              setCurrentPage(1);
            }}
          >
            Case 0.75
          </TabButton>
          <TabButton
            type="button"
            $active={activeCaseFilter === 'case_1'}
            onClick={() => {
              setActiveCaseFilter('case_1');
              setCurrentPage(1);
            }}
          >
            Case 1
          </TabButton>
        </TabsContainer>
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search uploaded receipts..."
        />
      </HeaderStack>
      <ContentArea>
        {isLoading ? (
          <TableSkeleton columns={columns.length} rows={8} />
        ) : (
          <>
            <Table 
              columns={columns}
              data={receipts.length > 0 ? receipts : [{ 
                id: 'no-data',
                businessName: debouncedSearch.trim()
                  ? 'No receipts found matching your search criteria.'
                  : activeCaseFilter !== 'all'
                    ? `No receipts found for ${formatCaseType(activeCaseFilter)}.`
                    : 'No uploaded receipts found.',
                businessType: '',
                businessId: '',
                value: '',
                points: 0,
                status: '',
                category: '',
                totalAmount: '',
                caseQuantity: '',
                itemsCount: '',
                imageUrl: '',
                createdAt: '',
              }]} 
            />
            {receipts.length > 0 && (
              <>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <SummaryText>
                  {isLoading
                    ? 'Fetching uploaded receipts...'
                    : `Showing page ${Math.min(currentPage, totalPages || 1)} of ${totalPages || 1}. ${
                        activeCaseFilter !== 'all' ? `${formatCaseType(activeCaseFilter)} - ` : ''
                      }Total receipts: ${totalCount}.`}
                </SummaryText>
              </>
            )}
          </>
        )}
      </ContentArea>
      <Modal 
        isOpen={statusUpdateModal.isOpen} 
        onClose={() => !isUpdating && setStatusUpdateModal({ isOpen: false, receipt: null })}
        maxWidth="500px"
      >
        <StatusUpdateModalContent>
          <StatusUpdateTitle>Update Receipt Status</StatusUpdateTitle>
          {statusUpdateModal.receipt && (
            <>
              <FormGroup>
                <Label>Current Status</Label>
                <StatusBadge status={statusUpdateModal.receipt.status}>
                  {statusUpdateModal.receipt.status}
                </StatusBadge>
              </FormGroup>
              <FormGroup>
                <Label>New Status *</Label>
                <Select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as 'approved' | 'pending' | 'rejected')}
                  disabled={isUpdating}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Admin Notes (Optional)</Label>
                <TextArea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this status update..."
                  disabled={isUpdating}
                />
              </FormGroup>
              <ModalActions>
                <ModalButton
                  onClick={() => {
                    if (!isUpdating) {
                      setStatusUpdateModal({ isOpen: false, receipt: null });
                      setAdminNotes('');
                    }
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </ModalButton>
                <ModalButton
                  $variant="primary"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </ModalButton>
              </ModalActions>
            </>
          )}
        </StatusUpdateModalContent>
      </Modal>
    </PageLayout>
  );
};

export default UploadedReceiptsPage;

