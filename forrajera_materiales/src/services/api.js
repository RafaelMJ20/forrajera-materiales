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
