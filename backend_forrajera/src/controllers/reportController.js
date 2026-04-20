export const reportController = {
  // Reporte de Ventas por Período
  async getSalesReport(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Período anterior (últimos 30 días vs 30 días anteriores)
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(today.getDate() - 60);

      const fetchSalesByDateRange = async (startDate, endDate) => {
        const sales = await req.prisma.sale.findMany({
          where: {
            active: 1,
            saleDate: {
              gte: startDate,
              lt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
        });

        return {
          totalSales: sales.length,
          totalRevenue: sales.reduce((sum, s) => sum + s.total, 0),
          totalGain: sales.reduce((sum, s) => sum + s.gain, 0),
        };
      };

      // Datos actuales
      const today_data = await fetchSalesByDateRange(today, today);
      const week_data = await fetchSalesByDateRange(startOfWeek, today);
      const month_data = await fetchSalesByDateRange(startOfMonth, today);
      const year_data = await fetchSalesByDateRange(startOfYear, today);

      // Datos periodo anterior para comparación
      const prev_week_data = await fetchSalesByDateRange(
        new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000),
        new Date(startOfWeek.getTime() - 1)
      );
      const prev_month_data = await fetchSalesByDateRange(
        new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() - 1, 1),
        new Date(startOfMonth.getTime() - 1)
      );
      const prev_year_data = await fetchSalesByDateRange(
        new Date(today.getFullYear() - 1, 0, 1),
        new Date(today.getFullYear(), 0, 0)
      );

      // Calcular porcentaje de cambio
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      res.json({
        today: today_data,
        week: {
          ...week_data,
          change: calculateChange(week_data.totalRevenue, prev_week_data.totalRevenue),
        },
        month: {
          ...month_data,
          change: calculateChange(month_data.totalRevenue, prev_month_data.totalRevenue),
        },
        year: {
          ...year_data,
          change: calculateChange(year_data.totalRevenue, prev_year_data.totalRevenue),
        },
      });
    } catch (error) {
      console.error("Error al generar reporte de ventas:", error);
      res.status(500).json({ error: "Error al generar reporte de ventas" });
    }
  },

  // Reporte de Ganancias
  async getGainsReport(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      const fetchGainsByDateRange = async (startDate, endDate) => {
        const sales = await req.prisma.sale.findMany({
          where: {
            active: 1,
            saleDate: {
              gte: startDate,
              lt: new Date(endDate.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          include: { items: true },
        });

        const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
        const totalGain = sales.reduce((sum, s) => sum + s.gain, 0);
        const marginPercentage = totalRevenue > 0 ? (totalGain / totalRevenue) * 100 : 0;

        return {
          totalSales: sales.length,
          totalRevenue,
          totalGain,
          marginPercentage,
          averageGainPerSale: sales.length > 0 ? totalGain / sales.length : 0,
        };
      };

      const today_data = await fetchGainsByDateRange(today, today);
      const week_data = await fetchGainsByDateRange(startOfWeek, today);
      const month_data = await fetchGainsByDateRange(startOfMonth, today);
      const year_data = await fetchGainsByDateRange(startOfYear, today);

      res.json({
        today: today_data,
        week: week_data,
        month: month_data,
        year: year_data,
      });
    } catch (error) {
      console.error("Error al generar reporte de ganancias:", error);
      res.status(500).json({ error: "Error al generar reporte de ganancias" });
    }
  },

  // Reporte de Productos
  async getProductsReport(req, res) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Obtener todas las ventas de los últimos 30 días
      const sales = await req.prisma.sale.findMany({
        where: {
          active: 1,
          saleDate: { gte: thirtyDaysAgo },
        },
        include: { items: { include: { product: true } } },
      });

      // Contar ventas por producto
      const productStats = new Map();

      sales.forEach((sale) => {
        sale.items.forEach((item) => {
          if (!productStats.has(item.productId)) {
            productStats.set(item.productId, {
              id: item.productId,
              name: item.product.name,
              totalQuantitySold: 0,
              totalRevenue: 0,
              totalGain: 0,
              timesS: 0,
            });
          }

          const stats = productStats.get(item.productId);
          stats.totalQuantitySold += item.quantity;
          stats.totalRevenue += item.subtotal;
          stats.totalGain += item.gain;
          stats.timesSold += 1;
        });
      });

      // Convertir a array y ordenar
      const productArray = Array.from(productStats.values());

      // Top 5 más vendidos
      const topSellers = productArray.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold).slice(0, 5);

      // Top 5 con más ganancia
      const topGainers = productArray.sort((a, b) => b.totalGain - a.totalGain).slice(0, 5);

      // Productos no vendidos en últimos 30 días
      const allProducts = await req.prisma.product.findMany({
        where: { active: 1 },
      });

      const notSold = allProducts.filter((p) => !productStats.has(p.id));

      res.json({
        topSellers,
        topGainers,
        notSold: notSold.slice(0, 10), // Top 10 no vendidos
        totalProductsTracked: allProducts.length,
        totalProductsSold: productArray.length,
      });
    } catch (error) {
      console.error("Error al generar reporte de productos:", error);
      res.status(500).json({ error: "Error al generar reporte de productos" });
    }
  },

  // Valor total del inventario
  async getInventoryValue(req, res) {
    try {
      const products = await req.prisma.product.findMany({
        where: { active: 1 },
      });

      const inventoryValue = products.reduce((total, product) => {
        return total + product.currentStock * product.purchasePrice;
      }, 0);

      const totalProducts = products.length;
      const lowStockProducts = products.filter((p) => p.currentStock < p.minimumStock).length;

      const productValues = products.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.currentStock,
        purchasePrice: p.purchasePrice,
        value: p.currentStock * p.purchasePrice,
      }));

      // Ordenar por valor descendente y obtener top 10
      const topByValue = productValues.sort((a, b) => b.value - a.value).slice(0, 10);

      res.json({
        totalInventoryValue: inventoryValue,
        totalProducts,
        lowStockProducts,
        topByValue,
        allProducts: productValues,
      });
    } catch (error) {
      console.error("Error al calcular valor de inventario:", error);
      res.status(500).json({ error: "Error al calcular valor de inventario" });
    }
  },

  // Dashboard General - Todo en un reporte
  async getDashboard(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);

      // Ventas y ganancias de hoy
      const todaysSales = await req.prisma.sale.findMany({
        where: {
          active: 1,
          saleDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      const todaysRevenue = todaysSales.reduce((sum, s) => sum + s.total, 0);
      const todaysGain = todaysSales.reduce((sum, s) => sum + s.gain, 0);

      // Ventas y ganancias del mes
      const monthsSales = await req.prisma.sale.findMany({
        where: {
          active: 1,
          saleDate: {
            gte: startOfMonth,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      const monthsRevenue = monthsSales.reduce((sum, s) => sum + s.total, 0);
      const monthsGain = monthsSales.reduce((sum, s) => sum + s.gain, 0);

      // Ventas y ganancias del año
      const yearsSales = await req.prisma.sale.findMany({
        where: {
          active: 1,
          saleDate: {
            gte: startOfYear,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });

      const yearsRevenue = yearsSales.reduce((sum, s) => sum + s.total, 0);
      const yearsGain = yearsSales.reduce((sum, s) => sum + s.gain, 0);

      // Valor del inventario
      const products = await req.prisma.product.findMany({
        where: { active: 1 },
      });

      const inventoryValue = products.reduce((total, product) => {
        return total + product.currentStock * product.purchasePrice;
      }, 0);

      res.json({
        sales: {
          today: {
            count: todaysSales.length,
            revenue: todaysRevenue,
            gain: todaysGain,
          },
          month: {
            count: monthsSales.length,
            revenue: monthsRevenue,
            gain: monthsGain,
          },
          year: {
            count: yearsSales.length,
            revenue: yearsRevenue,
            gain: yearsGain,
          },
        },
        inventory: {
          value: inventoryValue,
          products: products.length,
          lowStock: products.filter((p) => p.currentStock < p.minimumStock).length,
        },
      });
    } catch (error) {
      console.error("Error al generar dashboard:", error);
      res.status(500).json({ error: "Error al generar dashboard" });
    }
  },
};
