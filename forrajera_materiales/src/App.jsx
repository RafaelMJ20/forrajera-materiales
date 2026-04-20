import { useState, useEffect } from 'react';
import { Layout } from './components/Layout.jsx';
import { DashboardPage } from './components/Dashboard/DashboardPage.jsx';
import { ProductsPage } from './components/Inventory/ProductsPage.jsx';
import { CategoriesPage } from './components/Inventory/CategoriesPage.jsx';
import { LowStockPage } from './components/Inventory/LowStockPage.jsx';
import { SalesPage } from './components/Sales/SalesPage.jsx';
import { SalesHistoryPage } from './components/Sales/SalesHistoryPage.jsx';
import { ReportsPage } from './components/Reports/ReportsPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    return hash;
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || 'products';
      setCurrentPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'low-stock':
        return <LowStockPage />;
      case 'sales':
        return <SalesPage />;
      case 'sales-history':
        return <SalesHistoryPage />;
      case 'reports':
        return <ReportsPage />;
      case 'products':
      default:
        return <ProductsPage />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default App;


