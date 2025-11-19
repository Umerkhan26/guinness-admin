import { FiHome, FiUsers, FiBriefcase, FiPackage, FiAward, FiTruck, FiShoppingBag, FiCoffee, FiShoppingCart, FiTrendingUp, FiSettings } from 'react-icons/fi';

export const sidebarData = {
  user: {
    name: 'Admin',
    avatar: '', // You can add a URL to an avatar image here if you have one
  },
  navItems: [
    { id: 'home', title: 'Dashboard', path: '/', icon: 'FiHome' },
    { id: 'users', title: 'Users', path: '/users', icon: 'FiUsers' },
    { id: 'businesses', title: 'Businesses', path: '/businesses', icon: 'FiBriefcase' },
    { id: 'rewards', title: 'Rewards', path: '/rewards', icon: 'FiPackage' },
    { id: 'redeems', title: 'Redeems', path: '/redeems', icon: 'FiAward' },
    { id: 'businessInfo', title: 'BusinessInfo', path: '/business-info', icon: 'FiTruck' },
    { id: 'rum-shops', title: 'Rum Shops', path: '/rum-shops', icon: 'FiShoppingBag' },
    { id: 'supermarkets', title: 'Supermarkets', path: '/supermarkets', icon: 'FiShoppingCart' },
    { id: 'bars', title: 'Bars', path: '/bars', icon: 'FiCoffee' },
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
};
