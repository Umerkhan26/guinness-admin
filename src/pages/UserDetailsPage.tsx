import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiUser, FiBriefcase, FiMail, FiPhone, FiMapPin, FiAward } from 'react-icons/fi';
import { getUserById, type UserDetails } from '../api/userApi';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const BreadcrumbLink = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primaryBright};
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: ${({ theme }) => theme.colors.subtle};
`;

const BreadcrumbCurrent = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.cardAlt};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.card};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.muted};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.danger};
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const ContentCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 1.25rem;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.bg};
  font-size: 1rem;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const InfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.cardAlt};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableLabel = styled.td`
  padding: 0.65rem 1rem 0.65rem 0;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.subtle};
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: 40%;
  vertical-align: top;
`;

const TableValue = styled.td`
  padding: 0.65rem 0;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  font-weight: 500;
  vertical-align: top;
`;

const Badge = styled.span<{ $variant?: 'primary' | 'success' | 'warning' | 'muted' }>`
  display: inline-block;
  padding: 0.35rem 0.85rem;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
  background-color: ${({ theme, $variant }) => {
    if ($variant === 'primary') return theme.colors.primary;
    if ($variant === 'success') return theme.colors.success;
    if ($variant === 'warning') return theme.colors.warning;
    return theme.colors.muted;
  }};
  color: ${({ theme }) => theme.colors.bg};
`;

const StatsSection = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid ${({ theme }) => theme.colors.border};
`;

const StatsTitle = styled.h3`
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}15 0%, ${({ theme }) => theme.colors.primary}05 100%);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const StatLabel = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.subtle};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
`;

const InfoText = styled.span`
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.95rem;
`;

const UserDetailsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId) {
        setError('User ID is required.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getUserById(userId);
        if (response.success) {
          setUserDetails(response.data);
        } else {
          setError(response.message || 'Failed to fetch user details.');
          toast.error(response.message || 'Failed to fetch user details.');
        }
      } catch (err) {
        const errorMessage = 'Unexpected error while fetching user details.';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Failed to fetch user details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <BreadcrumbContainer>
          <BreadcrumbLink onClick={() => navigate('/history')}>History</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbCurrent>User Details</BreadcrumbCurrent>
        </BreadcrumbContainer>
        <LoadingContainer>Loading user details...</LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !userDetails) {
    return (
      <PageContainer>
        <BreadcrumbContainer>
          <BreadcrumbLink onClick={() => navigate('/history')}>History</BreadcrumbLink>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbCurrent>User Details</BreadcrumbCurrent>
        </BreadcrumbContainer>
        <ErrorContainer>
          <p>{error || 'User not found'}</p>
          <BackButton onClick={handleBack}>
            <FiArrowLeft /> Go Back
          </BackButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BreadcrumbContainer>
        <BreadcrumbLink onClick={() => navigate('/history')}>History</BreadcrumbLink>
        <BreadcrumbSeparator>/</BreadcrumbSeparator>
        <BreadcrumbCurrent>User Details</BreadcrumbCurrent>
      </BreadcrumbContainer>

      <PageHeader>
        <BackButton onClick={handleBack}>
          <FiArrowLeft /> Back
        </BackButton>
        <PageTitle>User Details</PageTitle>
      </PageHeader>

      <MainGrid>
        <ContentCard>
          <SectionHeader>
            <SectionIcon>
              <FiUser />
            </SectionIcon>
            <SectionTitle>User Information</SectionTitle>
          </SectionHeader>
          <InfoTable>
            <tbody>
              <TableRow>
                <TableLabel>User ID</TableLabel>
                <TableValue>{userDetails._id}</TableValue>
              </TableRow>
              {userDetails.firstName && (
                <TableRow>
                  <TableLabel>First Name</TableLabel>
                  <TableValue>{userDetails.firstName}</TableValue>
                </TableRow>
              )}
              {userDetails.lastName && (
                <TableRow>
                  <TableLabel>Last Name</TableLabel>
                  <TableValue>{userDetails.lastName}</TableValue>
                </TableRow>
              )}
              {userDetails.email && (
                <TableRow>
                  <TableLabel>
                    <InfoRow>
                      <InfoIcon><FiMail /></InfoIcon>
                      <InfoText>Email</InfoText>
                    </InfoRow>
                  </TableLabel>
                  <TableValue>{userDetails.email}</TableValue>
                </TableRow>
              )}
              {userDetails.phone && (
                <TableRow>
                  <TableLabel>
                    <InfoRow>
                      <InfoIcon><FiPhone /></InfoIcon>
                      <InfoText>Phone</InfoText>
                    </InfoRow>
                  </TableLabel>
                  <TableValue>{userDetails.phone}</TableValue>
                </TableRow>
              )}
              {userDetails.location && (
                <TableRow>
                  <TableLabel>
                    <InfoRow>
                      <InfoIcon><FiMapPin /></InfoIcon>
                      <InfoText>Location</InfoText>
                    </InfoRow>
                  </TableLabel>
                  <TableValue>{userDetails.location}</TableValue>
                </TableRow>
              )}
              <TableRow>
                <TableLabel>Role</TableLabel>
                <TableValue>
                  <Badge $variant={userDetails.role === 'consumer' ? 'primary' : userDetails.role === 'business' ? 'success' : 'muted'}>
                    {userDetails.role}
                  </Badge>
                </TableValue>
              </TableRow>
              {userDetails.points != null && (
                <TableRow>
                  <TableLabel>
                    <InfoRow>
                      <InfoIcon><FiAward /></InfoIcon>
                      <InfoText>Points</InfoText>
                    </InfoRow>
                  </TableLabel>
                  <TableValue style={{ fontSize: '1.15rem', fontWeight: 600, color: 'inherit' }}>
                    {userDetails.points.toLocaleString()}
                  </TableValue>
                </TableRow>
              )}
            </tbody>
          </InfoTable>
        </ContentCard>

        {userDetails.businessInfo && (
          <ContentCard>
            <SectionHeader>
              <SectionIcon>
                <FiBriefcase />
              </SectionIcon>
              <SectionTitle>Business Information</SectionTitle>
            </SectionHeader>
            <InfoTable>
              <tbody>
                {userDetails.businessInfo.businessType && (
                  <TableRow>
                    <TableLabel>Business Type</TableLabel>
                    <TableValue>{userDetails.businessInfo.businessType}</TableValue>
                  </TableRow>
                )}
                {userDetails.businessInfo.ownerName && (
                  <TableRow>
                    <TableLabel>Owner Name</TableLabel>
                    <TableValue>{userDetails.businessInfo.ownerName}</TableValue>
                  </TableRow>
                )}
                {userDetails.businessInfo.address && (
                  <TableRow>
                    <TableLabel>
                      <InfoRow>
                        <InfoIcon><FiMapPin /></InfoIcon>
                        <InfoText>Address</InfoText>
                      </InfoRow>
                    </TableLabel>
                    <TableValue>{userDetails.businessInfo.address}</TableValue>
                  </TableRow>
                )}
                {userDetails.businessInfo.method && (
                  <TableRow>
                    <TableLabel>Method</TableLabel>
                    <TableValue>{userDetails.businessInfo.method}</TableValue>
                  </TableRow>
                )}
                {userDetails.businessInfo.approvedByAdmin != null && (
                  <TableRow>
                    <TableLabel>Approval Status</TableLabel>
                    <TableValue>
                      <Badge $variant={userDetails.businessInfo.approvedByAdmin ? 'success' : 'warning'}>
                        {userDetails.businessInfo.approvedByAdmin ? 'Approved' : 'Pending'}
                      </Badge>
                    </TableValue>
                  </TableRow>
                )}
              </tbody>
            </InfoTable>
            {userDetails.businessInfo.stats && (
              <StatsSection>
                <StatsTitle>Business Statistics</StatsTitle>
                <StatsGrid>
                  {userDetails.businessInfo.stats.casesSold != null && (
                    <StatCard>
                      <StatLabel>Cases Sold</StatLabel>
                      <StatValue>{userDetails.businessInfo.stats.casesSold}</StatValue>
                    </StatCard>
                  )}
                  {userDetails.businessInfo.stats.receiptsUploaded != null && (
                    <StatCard>
                      <StatLabel>Receipts Uploaded</StatLabel>
                      <StatValue>{userDetails.businessInfo.stats.receiptsUploaded}</StatValue>
                    </StatCard>
                  )}
                  {userDetails.businessInfo.stats.roundsSold != null && (
                    <StatCard>
                      <StatLabel>Rounds Sold</StatLabel>
                      <StatValue>{userDetails.businessInfo.stats.roundsSold}</StatValue>
                    </StatCard>
                  )}
                </StatsGrid>
              </StatsSection>
            )}
          </ContentCard>
        )}
      </MainGrid>
    </PageContainer>
  );
};

export default UserDetailsPage;

