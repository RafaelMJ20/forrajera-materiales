const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Categorías
export const categoryService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error("Error fetching categories");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`);
    if (!response.ok) throw new Error("Error fetching category");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error creating category");
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error updating category");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting category");
    return response.json();
  },
};

// Productos
export const productService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.append("categoryId", filters.categoryId);
    if (filters.search) params.append("search", filters.search);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    if (filters.order) params.append("order", filters.order);

    const response = await fetch(
      `${API_BASE_URL}/products?${params.toString()}`
    );
    if (!response.ok) throw new Error("Error fetching products");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) throw new Error("Error fetching product");
    return response.json();
  },

  getLowStock: async () => {
    const response = await fetch(`${API_BASE_URL}/products/low-stock`);
    if (!response.ok) throw new Error("Error fetching low stock products");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error creating product");
    }
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error updating product");
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting product");
    return response.json();
  },
};

// Ventas
export const saleService = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);

    const response = await fetch(
      `${API_BASE_URL}/sales?${params.toString()}`
    );
    if (!response.ok) throw new Error("Error fetching sales");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`);
    if (!response.ok) throw new Error("Error fetching sale");
    return response.json();
  },

  getByDateRange: async (startDate, endDate) => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    const response = await fetch(`${API_BASE_URL}/sales/range?${params.toString()}`);
    if (!response.ok) throw new Error("Error fetching sales by date range");
    return response.json();
  },

  getByPeriod: async (period, date) => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);

    const response = await fetch(
      `${API_BASE_URL}/sales/period/${period}?${params.toString()}`
    );
    if (!response.ok) throw new Error("Error fetching sales by period");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error creating sale");
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/sales/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting sale");
    return response.json();
  },
};

// Reportes
export const reportService = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/dashboard`);
    if (!response.ok) throw new Error("Error fetching dashboard");
    return response.json();
  },

  getSalesReport: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/sales`);
    if (!response.ok) throw new Error("Error fetching sales report");
    return response.json();
  },

  getGainsReport: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/gains`);
    if (!response.ok) throw new Error("Error fetching gains report");
    return response.json();
  },

  getProductsReport: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/products`);
    if (!response.ok) throw new Error("Error fetching products report");
    return response.json();
  },

  getInventoryReport: async () => {
    const response = await fetch(`${API_BASE_URL}/reports/inventory`);
    if (!response.ok) throw new Error("Error fetching inventory report");
    return response.json();
  },

  getDailyTrend: async (days = 30) => {
    const response = await fetch(`${API_BASE_URL}/reports/daily-trend?days=${days}`);
    if (!response.ok) throw new Error("Error fetching daily trend");
    return response.json();
  },

  getMonthlyTrend: async (months = 12) => {
    const response = await fetch(`${API_BASE_URL}/reports/monthly-trend?months=${months}`);
    if (!response.ok) throw new Error("Error fetching monthly trend");
    return response.json();
  },
};

// Vehículos
export const vehicleService = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`);
    if (!response.ok) throw new Error("Error fetching vehicles");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`);
    if (!response.ok) throw new Error("Error fetching vehicle");
    return response.json();
  },

  getStats: async (id) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/stats/${id}`);
    if (!response.ok) throw new Error("Error fetching vehicle stats");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error creating vehicle");
    }
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error updating vehicle");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/vehicles/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting vehicle");
    return response.json();
  },
};

// Combustible
export const fuelService = {
  getAll: async (vehicleId) => {
    const params = vehicleId ? `?vehicleId=${vehicleId}` : "";
    const response = await fetch(`${API_BASE_URL}/fuel${params}`);
    if (!response.ok) throw new Error("Error fetching fuel logs");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/fuel/${id}`);
    if (!response.ok) throw new Error("Error fetching fuel log");
    return response.json();
  },

  getExpensesByPeriod: async (vehicleId, period = "month") => {
    const params = new URLSearchParams();
    params.append("period", period);
    if (vehicleId) params.append("vehicleId", vehicleId);
    const response = await fetch(`${API_BASE_URL}/fuel/expenses/by-period?${params}`);
    if (!response.ok) throw new Error("Error fetching expenses by period");
    return response.json();
  },

  getExpensesByVehicle: async (month) => {
    const params = month ? `?month=${month}` : "";
    const response = await fetch(`${API_BASE_URL}/fuel/expenses/by-vehicle${params}`);
    if (!response.ok) throw new Error("Error fetching expenses by vehicle");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/fuel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error creating fuel log");
    }
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/fuel/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error updating fuel log");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/fuel/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting fuel log");
    return response.json();
  },
};

// Mantenimiento
export const maintenanceService = {
  getAll: async (vehicleId) => {
    const params = vehicleId ? `?vehicleId=${vehicleId}` : "";
    const response = await fetch(`${API_BASE_URL}/maintenance${params}`);
    if (!response.ok) throw new Error("Error fetching maintenance logs");
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`);
    if (!response.ok) throw new Error("Error fetching maintenance log");
    return response.json();
  },

  getByVehicle: async (vehicleId) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/by-vehicle/${vehicleId}`);
    if (!response.ok) throw new Error("Error fetching vehicle maintenance history");
    return response.json();
  },

  getUpcomingServices: async () => {
    const response = await fetch(`${API_BASE_URL}/maintenance/upcoming`);
    if (!response.ok) throw new Error("Error fetching upcoming services");
    return response.json();
  },

  getSummary: async (month) => {
    const params = month ? `?month=${month}` : "";
    const response = await fetch(`${API_BASE_URL}/maintenance/summary${params}`);
    if (!response.ok) throw new Error("Error fetching maintenance summary");
    return response.json();
  },

  create: async (data) => {
    const response = await fetch(`${API_BASE_URL}/maintenance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error creating maintenance log");
    }
    return response.json();
  },

  update: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Error updating maintenance log");
    return response.json();
  },

  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/maintenance/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error deleting maintenance log");
    return response.json();
  },
};
