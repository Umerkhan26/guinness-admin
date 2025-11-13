import React from 'react';
import styled from 'styled-components';
import { FiUsers, FiBriefcase, FiTruck, FiShoppingBag } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Import mock data to get counts
import { USERS } from '../data/users';
import { BUSINESSES } from '../data/businesses';
import { WHOLESALERS } from '../data/wholesalers';
import { RUM_SHOPS } from '../data/rumShops';

const DashboardContainer = styled.div`
  width: 100%;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1.5rem; /* Reduced margin */
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.gradient.goldSoft};
  padding: 1.5rem 2rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow};
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    "icon count"
    "icon label";
  align-items: center;
  column-gap: 1.5rem;
`;

const StatIcon = styled.div`
  grid-area: icon;
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const StatCount = styled.div`
  grid-area: count;
  font-size: 2rem;
  font-weight: bold;
  align-self: end;
`;

const StatLabel = styled.div`
  grid-area: label;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.subtle};
  align-self: start;
`;


const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.card};
  padding: 2rem;
  border-radius: ${({ theme }) => theme.radii.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  height: 400px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const DashboardPage: React.FC = () => {
  const data = [
    { name: 'Users', total: USERS.length },
    { name: 'Businesses', total: BUSINESSES.length },
    { name: 'Wholesalers', total: WHOLESALERS.length },
    { name: 'Rum Shops', total: RUM_SHOPS.length },
  ];

  return (
    <DashboardContainer>
      <Title>Dashboard</Title>
      <StatGrid>
        <StatCard>
          <StatIcon><FiUsers /></StatIcon>
          <StatCount>{USERS.length}</StatCount>
          <StatLabel>Total Users</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon><FiBriefcase /></StatIcon>
          <StatCount>{BUSINESSES.length}</StatCount>
          <StatLabel>Total Businesses</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon><FiTruck /></StatIcon>
          <StatCount>{WHOLESALERS.length}</StatCount>
          <StatLabel>Total Wholesalers</StatLabel>
        </StatCard>
        <StatCard>
          <StatIcon><FiShoppingBag /></StatIcon>
          <StatCount>{RUM_SHOPS.length}</StatCount>
          <StatLabel>Total Rum Shops</StatLabel>
        </StatCard>
      </StatGrid>

      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderColor: '#374151',
              }}
            />
            <Bar dataKey="total" fill="#eab308" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </DashboardContainer>
  );
};

export default DashboardPage;
