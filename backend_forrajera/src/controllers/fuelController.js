export const fuelController = {
  // Obtener todos los registros de combustible
  async getAll(req, res) {
    try {
      const { vehicleId } = req.query;
      const where = { active: 1 };

      if (vehicleId) {
        where.vehicleId = parseInt(vehicleId);
      }

      const fuelLogs = await req.prisma.fuelLog.findMany({
        where,
        include: { vehicle: true },
        orderBy: { fuelDate: "desc" },
      });

      res.json(fuelLogs);
    } catch (error) {
      console.error("Error al obtener registros de combustible:", error);
      res.status(500).json({ error: "Error al obtener registros de combustible" });
    }
  },

  // Obtener un registro específico
  async getById(req, res) {
    try {
      const { id } = req.params;
      const fuelLog = await req.prisma.fuelLog.findUnique({
        where: { id: parseInt(id) },
        include: { vehicle: true },
      });

      if (!fuelLog || fuelLog.active === 0) {
        return res.status(404).json({ error: "Registro de combustible no encontrado" });
      }

      res.json(fuelLog);
    } catch (error) {
      console.error("Error al obtener registro:", error);
      res.status(500).json({ error: "Error al obtener registro" });
    }
  },

  // Crear registro de combustible
  async create(req, res) {
    try {
      const { vehicleId, litersLoaded, costTotal, currentMileage, gasStation, driver, notes } = req.body;

      // Validar campos requeridos
      if (!vehicleId || !litersLoaded || !costTotal || currentMileage === undefined) {
        return res.status(400).json({
          error: "Campos requeridos: vehicleId, litersLoaded, costTotal, currentMileage",
        });
      }

      // Verificar que el vehículo existe
      const vehicle = await req.prisma.vehicle.findUnique({
        where: { id: parseInt(vehicleId) },
      });

      if (!vehicle || vehicle.active === 0) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
      }

      const fuelLog = await req.prisma.fuelLog.create({
        data: {
          vehicleId: parseInt(vehicleId),
          litersLoaded: parseFloat(litersLoaded),
          costTotal: parseFloat(costTotal),
          currentMileage: parseFloat(currentMileage),
          gasStation: gasStation || null,
          driver: driver || null,
          notes: notes || null,
        },
        include: { vehicle: true },
      });

      res.status(201).json(fuelLog);
    } catch (error) {
      console.error("Error al crear registro de combustible:", error);
      res.status(500).json({ error: "Error al crear registro de combustible" });
    }
  },

  // Actualizar registro
  async update(req, res) {
    try {
      const { id } = req.params;
      const { litersLoaded, costTotal, currentMileage, gasStation, driver, notes } = req.body;

      const fuelLog = await req.prisma.fuelLog.findUnique({
        where: { id: parseInt(id) },
      });

      if (!fuelLog || fuelLog.active === 0) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      const updated = await req.prisma.fuelLog.update({
        where: { id: parseInt(id) },
        data: {
          ...(litersLoaded && { litersLoaded: parseFloat(litersLoaded) }),
          ...(costTotal && { costTotal: parseFloat(costTotal) }),
          ...(currentMileage !== undefined && { currentMileage: parseFloat(currentMileage) }),
          ...(gasStation !== undefined && { gasStation }),
          ...(driver !== undefined && { driver }),
          ...(notes !== undefined && { notes }),
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

      const fuelLog = await req.prisma.fuelLog.findUnique({
        where: { id: parseInt(id) },
      });

      if (!fuelLog || fuelLog.active === 0) {
        return res.status(404).json({ error: "Registro no encontrado" });
      }

      await req.prisma.fuelLog.update({
        where: { id: parseInt(id) },
        data: { active: 0 },
      });

      res.json({ message: "Registro eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar registro:", error);
      res.status(500).json({ error: "Error al eliminar registro" });
    }
  },

  // Obtener gasto de combustible por período
  async getExpensesByPeriod(req, res) {
    try {
      const { vehicleId, period } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let startDate = new Date(today);

      if (period === "week") {
        startDate.setDate(today.getDate() - 7);
      } else if (period === "month") {
        startDate.setMonth(today.getMonth() - 1);
      } else if (period === "day") {
        startDate = new Date(today);
      } else {
        // Por defecto, mes actual
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      }

      const where = {
        active: 1,
        fuelDate: { gte: startDate, lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
      };

      if (vehicleId) {
        where.vehicleId = parseInt(vehicleId);
      }

      const fuelLogs = await req.prisma.fuelLog.findMany({
        where,
        include: { vehicle: true },
      });

      const totalLiters = fuelLogs.reduce((sum, log) => sum + log.litersLoaded, 0);
      const totalCost = fuelLogs.reduce((sum, log) => sum + log.costTotal, 0);
      const costPerLiter = totalLiters > 0 ? (totalCost / totalLiters).toFixed(2) : 0;

      res.json({
        period,
        startDate,
        endDate: today,
        totalFuelLoads: fuelLogs.length,
        totalLiters: totalLiters.toFixed(2),
        totalCost: totalCost.toFixed(2),
        costPerLiter,
        logs: fuelLogs,
      });
    } catch (error) {
      console.error("Error al obtener gastos por período:", error);
      res.status(500).json({ error: "Error al obtener gastos por período" });
    }
  },

  // Obtener gasto por vehículo
  async getExpensesByVehicle(req, res) {
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

      const fuelLogs = await req.prisma.fuelLog.findMany({
        where: {
          active: 1,
          fuelDate: { gte: startDate, lte: endDate },
        },
        include: { vehicle: true },
      });

      // Agrupar por vehículo
      const expensesByVehicle = {};

      fuelLogs.forEach((log) => {
        const vehicleId = log.vehicleId;
        if (!expensesByVehicle[vehicleId]) {
          expensesByVehicle[vehicleId] = {
            vehicleId: log.vehicle.id,
            vehicle: `${log.vehicle.brand} ${log.vehicle.model}`,
            licensePlate: log.vehicle.licensePlate,
            totalLiters: 0,
            totalCost: 0,
            fuelLoads: 0,
            logs: [],
          };
        }
        expensesByVehicle[vehicleId].totalLiters += log.litersLoaded;
        expensesByVehicle[vehicleId].totalCost += log.costTotal;
        expensesByVehicle[vehicleId].fuelLoads += 1;
        expensesByVehicle[vehicleId].logs.push(log);
      });

      // Convertir a array y ordenar por gasto
      const data = Object.values(expensesByVehicle)
        .map((v) => ({
          ...v,
          totalLiters: v.totalLiters.toFixed(2),
          totalCost: v.totalCost.toFixed(2),
          costPerLiter: (v.totalCost / v.totalLiters).toFixed(2),
        }))
        .sort((a, b) => parseFloat(b.totalCost) - parseFloat(a.totalCost));

      res.json({
        month: month || today.toISOString().slice(0, 7),
        startDate,
        endDate,
        vehicleCount: data.length,
        data,
      });
    } catch (error) {
      console.error("Error al obtener gastos por vehículo:", error);
      res.status(500).json({ error: "Error al obtener gastos por vehículo" });
    }
  },
};
