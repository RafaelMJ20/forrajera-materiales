import { useState } from "react";

export const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gray-900 text-white shadow-lg transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          {isSidebarOpen && <h1 className="text-xl font-bold">Forrajera y Materiales</h1>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {/* Inventario */}
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Inventario</p>
          </div>
          {[
            { name: "Categorías", icon: "🏷️", href: "#categories" },
            { name: "Productos", icon: "📦", href: "#products" },
            { name: "Stock Bajo", icon: "⚠️", href: "#low-stock" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </a>
          ))}

          {/* Ventas */}
          <div className="px-4 py-2 mt-6 pt-6 border-t border-gray-800">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ventas</p>
          </div>
          {[
            { name: "Nueva Venta", icon: "💳", href: "#sales" },
            { name: "Historial", icon: "📊", href: "#sales-history" },
          ].map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-sm font-medium"
            >
              <span className="text-xl">{item.icon}</span>
              {isSidebarOpen && <span>{item.name}</span>}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="bg-white shadow-sm">
          <div className="px-8 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Gestor de Inventario</h2>
            <div className="flex items-center gap-4">
              <img
                src="https://via.placeholder.com/40"
                alt="Avatar"
                className="w-10 h-10 rounded-full"
              />
            </div>
          </div>
        </header>

        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
