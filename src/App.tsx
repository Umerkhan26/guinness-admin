import { useState } from 'react'
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
// New mock data imports
import { BUSINESSES } from './data/businesses';
import { ITEMS } from './data/items';
import { REDEEMS } from './data/redeems';
import { WHOLESALERS } from './data/wholesalers';
import { RUM_SHOPS } from './data/rumShops';
import { SUPERMARKETS } from './data/supermarkets';
import { BARS } from './data/bars';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Router>
        {isLoggedIn ? (
          <div style={{ display: 'flex' }}>
            <Sidebar onLogout={handleLogout} />
            <MainContent>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/businesses" element={<BusinessesPage />} />
                <Route path="/items" element={<DataTablePage title="Items" data={ITEMS} columns={[{ key: 'name', header: 'Name' }, { key: 'sku', header: 'SKU' }, { key: 'price', header: 'Price' }, { key: 'inStock', header: 'In Stock' }, { key: 'category', header: 'Category' }, { key: 'supplier', header: 'Supplier' }]} />} />
                <Route path="/redeems" element={<DataTablePage title="Redeems" data={REDEEMS} columns={[{ key: 'item', header: 'Item' }, { key: 'user', header: 'User' }, { key: 'status', header: 'Status' }, { key: 'date', header: 'Date' }, { key: 'transactionId', header: 'Transaction ID' }, { key: 'points', header: 'Points' }]} />} />
                <Route path="/wholesalers" element={<DataTablePage title="Wholesalers" data={WHOLESALERS} columns={[{ key: 'name', header: 'Name' }, { key: 'contactPerson', header: 'Contact' }, { key: 'region', header: 'Region' }, { key: 'phone', header: 'Phone' }, { key: 'email', header: 'Email' }, { key: 'address', header: 'Address' }]} />} />
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
