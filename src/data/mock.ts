import { FiHome, FiUsers, FiBriefcase, FiPackage, FiAward, FiTruck, FiShoppingBag, FiCoffee, FiShoppingCart, FiTrendingUp, FiSettings, FiClock } from 'react-icons/fi';

export const sidebarData = {
  user: {
    name: 'Admin',
    avatar: '', // Using icon-based admin badge instead
  },
      navItems: [
        { id: 'home', title: 'Dashboard', path: '/', icon: 'FiHome' },
        { id: 'users', title: 'Users', path: '/users', icon: 'FiUsers' },
        { id: 'history', title: 'History', path: '/history', icon: 'FiClock' },
        { id: 'supermarkets', title: 'Uploaded Receipts', path: '/supermarkets', icon: 'FiShoppingCart' },
        { id: 'redeems', title: 'Redeems', path: '/redeems', icon: 'FiAward' },
        { id: 'rewards', title: 'Rewards', path: '/rewards', icon: 'FiPackage' },
        { id: 'businesses', title: 'Businesses', path: '/businesses', icon: 'FiBriefcase' },
        { id: 'businessInfo', title: 'BusinessInfo', path: '/business-info', icon: 'FiTruck' },
        // { id: 'rum-shops', title: 'Rum Shops', path: '/rum-shops', icon: 'FiShoppingBag' },
        // { id: 'bars', title: 'Bars', path: '/bars', icon: 'FiCoffee' },
      ],
};

export const icons: { [key: string]: React.ElementType } = {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiPackage,
  FiAward,
  FiTruck,
  FiShoppingBag,
  FiCoffee,
  FiShoppingCart,
  FiTrendingUp,
  FiSettings,
  FiClock,
};
