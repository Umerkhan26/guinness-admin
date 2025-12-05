import { useEffect, useState } from 'react'
import './App.css'
import LoginPage from './pages/LoginPage'
import Sidebar from './components/Sidebar'
import { ThemeProvider } from 'styled-components'
import { theme } from './styles/theme'
import DashboardPage from './pages/DashboardPage'
import { GlobalStyle } from './styles/GlobalStyle'
import { MainContent } from './styles/Layout'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UsersPage from './pages/UsersPage'
import DataTablePage from './pages/DataTablePage'
import BusinessesPage from './pages/BusinessesPage';
import RewardsPage from './pages/RewardsPage';
import RedeemsPage from './pages/RedeemsPage';
import BusinessInfoPage from './pages/BusinessInfoPage';
import HistoryPage from './pages/HistoryPage';
import UserDetailsPage from './pages/UserDetailsPage';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import type { LoginSuccessResponse } from './api/userApi';
import { Toaster } from 'react-hot-toast';
// New mock data imports
import { RUM_SHOPS } from './data/rumShops';
import { SUPERMARKETS } from './data/supermarkets';
import { BARS } from './data/bars';

const getInitialAuthState = () => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.localStorage.getItem('authToken'));
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getInitialAuthState);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  const handleLogin = (response: LoginSuccessResponse) => {
    setIsLoggedIn(true);
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('currentUser', JSON.stringify(response.user));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  };

  useEffect(() => {
    if (isLoggedIn) return;
    const token = typeof window !== 'undefined' ? window.localStorage.getItem('authToken') : null;
    if (token) {
      setIsLoggedIn(true);
    }
  }, [isLoggedIn]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {isLoggedIn ? (
          <div style={{ display: 'flex' }}>
            <Sidebar 
              onLogout={handleLogout} 
              isOpen={isSidebarOpen} 
              setIsOpen={setIsSidebarOpen}
              isCollapsed={isSidebarCollapsed}
              setIsCollapsed={setIsSidebarCollapsed}
            />
            <MainContent $sidebarOpen={isSidebarOpen} $sidebarCollapsed={isSidebarCollapsed}>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/businesses" element={<BusinessesPage />} />
                <Route path="/rewards" element={<RewardsPage />} />
                <Route path="/redeems" element={<RedeemsPage />} />
                <Route path="/business-info" element={<BusinessInfoPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/user-details/:userId" element={<UserDetailsPage />} />
                <Route path="/business-details/:businessId" element={<BusinessDetailsPage />} />
                <Route path="/rum-shops" element={<DataTablePage title="Rum Shops" data={RUM_SHOPS} columns={[{ key: 'name', header: 'Name' }, { key: 'owner', header: 'Owner' }, { key: 'licenseNumber', header: 'License #' }, { key: 'address', header: 'Address' }, { key: 'phone', header: 'Phone' }, { key: 'rating', header: 'Rating' }]} />} />
                <Route path="/supermarkets" element={<DataTablePage title="Supermarkets" data={SUPERMARKETS} columns={[{ key: 'name', header: 'Name' }, { key: 'manager', header: 'Manager' }, { key: 'chain', header: 'Chain' }, { key: 'address', header: 'Address' }, { key: 'phone', header: 'Phone' }, { key: 'weeklySales', header: 'Weekly Sales' }]} />} />
                <Route path="/bars" element={<DataTablePage title="Bars" data={BARS} columns={[{ key: 'name', header: 'Name' }, { key: 'owner', header: 'Owner' }, { key: 'specialty', header: 'Specialty' }, { key: 'address', header: 'Address' }, { key: 'phone', header: 'Phone' }, { key: 'capacity', header: 'Capacity' }]} />} />
                {/* Fallback for other routes */}
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            </MainContent>
          </div>
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </Router>
    </ThemeProvider>
  )
}

export default App
