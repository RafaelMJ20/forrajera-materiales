export const maintenanceController = {
  // Obtener todos los registros de mantenimiento
  async getAll(req, res) {
    try {
      const { vehicleId } = req.query;
      const where = { active: 1 };

      if (vehicleId) {
        where.vehicleId = parseInt(vehicleId);
      }

      const maintenanceLogs = await req.prisma.maintenanceLog.findMany({
        where,
        include: { vehicle: true },
        orderBy: { maintenanceDate: "desc" },
      });

      res.json(maintenanceLogs);
    } catch (error) {
      console.error("Error al obtener registros de mantenimiento:", error);
      res.status(500).json({ error: "Error al obtener registros de mantenimiento" });
    }
  },

  // Obtener un registro específico
  async getById(req, res) {
    try {
      const { id } = req.params;
      const maintenanceLog = await req.prisma.maintenanceLog.findUnique({
        where: { id: parseInt(id) },
        include: { vehicle: true },
      });

      if (!maintenanceLog || maintenanceLog.active === 0) {
        return res.status(404).json({ error: "Registro de mantenimiento no encontrado" });
      }

      res.json(maintenanceLog);
    } catch (error) {
      console.error("Error al obtener registro:", error);
      res.status(500).json({ error: "Error al obtener registro" });
    }
  },

  // Crear registro de mantenimiento
  async create(req, res) {
    try {
      const { vehicleId, serviceType, mileage, cost, notes, nextServiceDate } = req.body;

      // Validar campos requeridos
      if (!vehicleId || !serviceType) {
        return res.status(400).json({
          error: "Campos requeridos: vehicleId, serviceType",
        });
      }

      // Verificar que el vehículo existe
      const vehicle = await req.prisma.vehicle.findUnique({
        where: { id: parseInt(vehicleId) },
      });

      if (!vehicle || vehicle.active === 0) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
      }

      const maintenanceLog = await req.prisma.maintenanceLog.create({
        data: {
          vehicleId: parseInt(vehicleId),
          serviceType,
          mileage: mileage ? parseFloat(mileage) : null,
          cost: cost ? parseFloat(cost) : null,
          notes: notes || null,
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
        },
        include: { vehicle: true },
      });

      res.status(201).json(maintenanceLog);
    } catch (error) {
      console.error("Error al crear registro de mantenimiento:", error);
      res.status(500).json({ error: "Error al crear registro de mantenimiento" });
    }
  },

  // Actualizar registro
  async update(req, res) {
    try {
      const { id } = req.params;
      const { serviceType, mileage, cost, notes, nextServiceDate } = req.body;

      const maintenanceLog = await req.prisma.maintenanceLog.findUnique({
        where: { id: parseInt(id) },
      });

      if (!maintenanceLog || maintenanceLog.active === 0) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const updated = await req.prisma.maintenanceLog.update({
        where: { id: parseInt(id) },
        data: {
          ...(serviceType && { serviceType }),
          ...(mileage !== undefined && { mileage: mileage ? parseFloat(mileage) : null }),
          ...(cost !== undefined && { cost: cost ? parseFloat(cost) : null }),
          ...(notes !== undefined && { notes }),
          ...(nextServiceDate !== undefined && { nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null }),
        },
        include: { vehicle: true },
      });

      res.json(updated);
    } catch (error) {
      console.error("Error al actualizar registro:", error);
      res.status(500).json({ error: "Error al actualizar registro" });
    }
  },

  // Eliminar registro (borrado lógico)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const maintenanceLog = await req.prisma.maintenanceLog.findUnique({
        where: { id: parseInt(id) },
      });

      if (!maintenanceLog || maintenanceLog.active === 0) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      await req.prisma.maintenanceLog.update({
        where: { id: parseInt(id) },
        data: { active: 0 },
      });

      res.json({ message: "Registro eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      res.status(500).json({ error: "Error al eliminar registro" });
    }
  },

  // Obtener historial de mantenimiento por vehículo
  async getHistoryByVehicle(req, res) {
    try {
      const { vehicleId } = req.params;

      const vehicle = await req.prisma.vehicle.findUnique({
        where: { id: parseInt(vehicleId) },
      });

      if (!vehicle || vehicle.active === 0) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
      }

      const maintenanceLogs = await req.prisma.maintenanceLog.findMany({
        where: { vehicleId: parseInt(vehicleId), active: 1 },
        orderBy: { maintenanceDate: "desc" },
      });

      const totalCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

      res.json({
        vehicleId: vehicle.id,
        vehicle: `${vehicle.brand} ${vehicle.model}`,
        licensePlate: vehicle.licensePlate,
        totalMaintenanceRecords: maintenanceLogs.length,
        totalCost: totalCost.toFixed(2),
        averageCost: maintenanceLogs.length > 0 ? (totalCost / maintenanceLogs.length).toFixed(2) : 0,
        logs: maintenanceLogs,
      });
    } catch (error) {
      console.error("Error al obtener historial:", error);
      res.status(500).json({ error: "Error al obtener historial" });
    }
  },

  // Obtener próximos servicios
  async getUpcomingServices(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingServices = await req.prisma.maintenanceLog.findMany({
        where: {
          active: 1,
          nextServiceDate: { gte: today },
        },
        include: { vehicle: true },
        orderBy: { nextServiceDate: "asc" },
      });

      res.json({
        today,
        count: upcomingServices.length,
        services: upcomingServices,
      });
    } catch (error) {
      console.error("Error al obtener próximos servicios:", error);
      res.status(500).json({ error: "Error al obtener próximos servicios" });
    }
  },

  // Obtener resumen de mantenimiento por mes
  async getMaintenanceSummary(req, res) {
    try {
      const { month } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let startDate, endDate;

      if (month) {
        const [year, monthNum] = month.split("-");
        startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
        endDate = new Date(parseInt(year), parseInt(monthNum), 0);
      } else {
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }

      const maintenanceLogs = await req.prisma.maintenanceLog.findMany({
        where: {
          active: 1,
          maintenanceDate: { gte: startDate, lte: endDate },
        },
        include: { vehicle: true },
      });

      const totalCost = maintenanceLogs.reduce((sum, log) => sum + (log.cost || 0), 0);

      // Agrupar por tipo de servicio
      const byServiceType = {};
      maintenanceLogs.forEach((log) => {
        if (!byServiceType[log.serviceType]) {
          byServiceType[log.serviceType] = { count: 0, totalCost: 0 };
        }
        byServiceType[log.serviceType].count += 1;
        byServiceType[log.serviceType].totalCost += log.cost || 0;
      });

      res.json({
        month: month || today.toISOString().slice(0, 7),
        startDate,
        endDate,
        totalRecords: maintenanceLogs.length,
        totalCost: totalCost.toFixed(2),
        averageCostPerService: maintenanceLogs.length > 0 ? (totalCost / maintenanceLogs.length).toFixed(2) : 0,
        byServiceType,
        logs: maintenanceLogs,
      });
    } catch (error) {
      console.error("Error al obtener resumen:", error);
      res.status(500).json({ error: "Error al obtener resumen" });
    }
  },
};
