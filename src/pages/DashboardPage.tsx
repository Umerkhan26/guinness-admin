import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FiUsers, FiBriefcase, FiCheckCircle, FiXCircle, FiClock, FiShield } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getUserDashboardSummary, type UserDashboardSummaryData } from '../api/userApi';
import { toast } from 'react-hot-toast';

const DashboardContainer = styled.div`
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem; /* Reduced margin */
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div<{ $variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' }>`
  background: ${({ theme, $variant }) => {
    if ($variant === 'success') return theme.colors.success + '15';
    if ($variant === 'warning') return theme.colors.warning + '15';
    if ($variant === 'danger') return theme.colors.danger + '15';
    if ($variant === 'info') return theme.colors.primary + '15';
    return theme.gradient.goldSoft;
  }};
  padding: 1.75rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme, $variant }) => {
    if ($variant === 'success') return theme.colors.success + '40';
    if ($variant === 'warning') return theme.colors.warning + '40';
    if ($variant === 'danger') return theme.colors.danger + '40';
    if ($variant === 'info') return theme.colors.primary + '40';
    return theme.colors.border;
  }};
  box-shadow: ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 25px rgba(245, 158, 11, 0.25);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatIcon = styled.div<{ $variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' }>`
  font-size: 2.5rem;
  color: ${({ theme, $variant }) => {
    if ($variant === 'success') return theme.colors.success;
    if ($variant === 'warning') return theme.colors.warning;
    if ($variant === 'danger') return theme.colors.danger;
    if ($variant === 'info') return theme.colors.primary;
    return theme.colors.primary;
  }};
  padding: 0.75rem;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ theme, $variant }) => {
    if ($variant === 'success') return theme.colors.success + '20';
    if ($variant === 'warning') return theme.colors.warning + '20';
    if ($variant === 'danger') return theme.colors.danger + '20';
    if ($variant === 'info') return theme.colors.primary + '20';
    return theme.colors.primary + '20';
  }};
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const StatCount = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.subtle};
  font-weight: 500;
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 0.25rem;
`;


const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  height: 400px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  margin: 2rem 0 1.5rem 0;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: ${({ theme }) => theme.colors.muted};
`;

const COLORS = ['#F59E0B', '#22c55e', '#ef4444', '#3b82f6', '#a855f7', '#f59e0b'];

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<UserDashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const response = await getUserDashboardSummary();
        if (response.success) {
          setSummary(response.data);
        } else {
          toast.error(response.message || 'Failed to fetch dashboard summary.');
        }
      } catch (error) {
        console.error('Failed to fetch dashboard summary:', error);
        toast.error('Unexpected error while fetching dashboard summary.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <DashboardContainer>
        <Title>Dashboard</Title>
        <LoadingContainer>Loading dashboard data...</LoadingContainer>
      </DashboardContainer>
    );
  }

  if (!summary) {
    return (
      <DashboardContainer>
        <Title>Dashboard</Title>
        <LoadingContainer>No data available</LoadingContainer>
      </DashboardContainer>
    );
  }

  // Prepare chart data
  const roleData = [
    { name: 'Consumers', value: summary.roles.consumers },
    { name: 'Businesses', value: summary.roles.businesses },
    { name: 'Admins', value: summary.roles.admins },
  ];

  const statusData = [
    { name: 'Active', value: summary.status.active },
    { name: 'Pending', value: summary.status.pending },
    { name: 'Blocked', value: summary.status.blocked },
    { name: 'Rejected', value: summary.status.rejected },
  ];

  const businessTypeData = summary.businesses.pendingByType.map((item) => ({
    name: item.businessType || 'Unknown',
    value: item.count,
  }));

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      
      {/* Main Stats */}
      <StatGrid>
        <StatCard $variant="primary">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.totalUsers}</StatCount>
              <StatLabel>Total Users</StatLabel>
            </StatContent>
            <StatIcon $variant="primary">
              <FiUsers />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="info">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.roles.consumers}</StatCount>
              <StatLabel>Consumers</StatLabel>
            </StatContent>
            <StatIcon $variant="info">
              <FiUsers />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="info">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.roles.businesses}</StatCount>
              <StatLabel>Businesses</StatLabel>
            </StatContent>
            <StatIcon $variant="info">
              <FiBriefcase />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="info">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.roles.admins}</StatCount>
              <StatLabel>Admins</StatLabel>
            </StatContent>
            <StatIcon $variant="info">
              <FiShield />
            </StatIcon>
          </StatHeader>
        </StatCard>
      </StatGrid>

      {/* User Status Stats */}
      <SectionTitle>User Status</SectionTitle>
      <StatGrid>
        <StatCard $variant="success">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.status.active}</StatCount>
              <StatLabel>Active Users</StatLabel>
              <StatSubtext>Currently active</StatSubtext>
            </StatContent>
            <StatIcon $variant="success">
              <FiCheckCircle />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="warning">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.status.pending}</StatCount>
              <StatLabel>Pending Users</StatLabel>
              <StatSubtext>Awaiting approval</StatSubtext>
            </StatContent>
            <StatIcon $variant="warning">
              <FiClock />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="danger">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.status.blocked}</StatCount>
              <StatLabel>Blocked Users</StatLabel>
              <StatSubtext>Currently blocked</StatSubtext>
            </StatContent>
            <StatIcon $variant="danger">
              <FiXCircle />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="danger">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.status.rejected}</StatCount>
              <StatLabel>Rejected Users</StatLabel>
              <StatSubtext>Rejected by admin</StatSubtext>
            </StatContent>
            <StatIcon $variant="danger">
              <FiXCircle />
            </StatIcon>
          </StatHeader>
        </StatCard>
      </StatGrid>

      {/* Business Approval Stats */}
      <SectionTitle>Business Approval</SectionTitle>
      <StatGrid>
        <StatCard $variant="success">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.businesses.approved}</StatCount>
              <StatLabel>Approved Businesses</StatLabel>
              <StatSubtext>Admin approved</StatSubtext>
            </StatContent>
            <StatIcon $variant="success">
              <FiCheckCircle />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="warning">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.businesses.pendingApproval}</StatCount>
              <StatLabel>Pending Approval</StatLabel>
              <StatSubtext>Awaiting admin approval</StatSubtext>
            </StatContent>
            <StatIcon $variant="warning">
              <FiClock />
            </StatIcon>
          </StatHeader>
        </StatCard>

        <StatCard $variant="danger">
          <StatHeader>
            <StatContent>
              <StatCount>{summary.businesses.rejected}</StatCount>
              <StatLabel>Rejected Businesses</StatLabel>
              <StatSubtext>Rejected by admin</StatSubtext>
            </StatContent>
            <StatIcon $variant="danger">
              <FiXCircle />
            </StatIcon>
          </StatHeader>
        </StatCard>
      </StatGrid>

      {/* Charts */}
      <SectionTitle>Analytics</SectionTitle>
      <ChartsGrid>
        <ChartContainer>
          <ChartTitle>Users by Role</ChartTitle>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={roleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f0f12',
                  borderColor: '#2a2a2e',
                  color: '#ffffff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer>
          <ChartTitle>Users by Status</ChartTitle>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={statusData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f0f12',
                  borderColor: '#2a2a2e',
                  color: '#ffffff',
                }}
              />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsGrid>

      {businessTypeData.length > 0 && (
        <>
          <SectionTitle>Businesses by Type</SectionTitle>
          <ChartContainer>
            <ChartTitle>Business Type Distribution</ChartTitle>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={businessTypeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f0f12',
                    borderColor: '#2a2a2e',
                    color: '#ffffff',
                  }}
                />
                <Bar dataKey="value" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      )}
    </DashboardContainer>
  );
};

export default DashboardPage;
