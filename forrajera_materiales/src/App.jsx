import { useState, useEffect } from 'react';
import { Layout } from './components/Layout.jsx';
import { ProductsPage } from './components/Inventory/ProductsPage.jsx';
import { CategoriesPage } from './components/Inventory/CategoriesPage.jsx';
import { LowStockPage } from './components/Inventory/LowStockPage.jsx';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.slice(1) || 'products';
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
      case 'categories':
        return <CategoriesPage />;
      case 'low-stock':
        return <LowStockPage />;
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


