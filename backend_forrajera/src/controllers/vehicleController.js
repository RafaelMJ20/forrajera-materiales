export const vehicleController = {
  // Obtener todos los vehículos
  async getAll(req, res) {
    try {
      const vehicles = await req.prisma.vehicle.findMany({
        where: { active: 1 },
        include: {
          fuelLogs: { where: { active: 1 }, orderBy: { fuelDate: "desc" } },
          maintenanceLogs: { where: { active: 1 }, orderBy: { maintenanceDate: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json(vehicles);
    } catch (error) {
      console.error("Error al obtener vehículos:", error);
      res.status(500).json({ error: "Error al obtener vehículos" });
    }
  },

  // Obtener un vehículo específico
  async getById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await req.prisma.vehicle.findUnique({
        where: { id: parseInt(id) },
        include: {
          fuelLogs: { where: { active: 1 }, orderBy: { fuelDate: "desc" } },
          maintenanceLogs: { where: { active: 1 }, orderBy: { maintenanceDate: "desc" } },
        },
      });

      if (!vehicle || vehicle.active === 0) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
      }

      res.json(vehicle);
    } catch (error) {
      console.error("Error al obtener vehículo:", error);
      res.status(500).json({ error: "Error al obtener vehículo" });
    }
  },

  // Crear vehículo
  async create(req, res) {
    try {
      const { brand, model, licensePlate, year, type, expectedFuelEfficiency, photo } = req.body;

      // Validar campos requeridos
      if (!brand || !model || !licensePlate || !year || !type || !expectedFuelEfficiency) {
        return res.status(400).json({ error: "Campos requeridos: brand, model, licensePlate, year, type, expectedFuelEfficiency" });
      }

      // Verificar que la placa sea única
      const existing = await req.prisma.vehicle.findUnique({
        where: { licensePlate },
      });

      if (existing && existing.active === 1) {
        return res.status(400).json({ error: "Ya existe un vehículo con esta placa" });
      }

      const vehicle = await req.prisma.vehicle.create({
        data: {
          brand,
          model,
          licensePlate,
          year: parseInt(year),
          type,
          expectedFuelEfficiency: parseFloat(expectedFuelEfficiency),
          photo: photo || null,
        },
      });

      res.status(201).json(vehicle);
    } catch (error) {
      console.error("Error al crear vehículo:", error);
      res.status(500).json({ error: "Error al crear vehículo" });
    }
  },

  // Actualizar vehículo
  async update(req, res) {
    try {
      const { id } = req.params;
      const { brand, model, licensePlate, year, type, expectedFuelEfficiency, photo } = req.body;

      const vehicle = await req.prisma.vehicle.findUnique({
        where: { id: parseInt(id) },
      });

      if (!vehicle || vehicle.active === 0) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
      }

      // Si está cambiando la placa, verificar que no exista otra con esa placa
      if (licensePlate && licensePlate !== vehicle.licensePlate) {
        const existing = await req.prisma.vehicle.findUnique({
          where: { licensePlate },
        });
        if (existing && existing.active === 1) {
          return res.status(400).json({ error: "Ya existe un vehículo con esta placa" });
        }
      }

      const updated = await req.prisma.vehicle.update({
        where: { id: parseInt(id) },
        data: {
          ...(brand && { brand }),
          ...(model && { model }),
          ...(licensePlate && { licensePlate }),
          ...(year && { year: parseInt(year) }),
          ...(type && { type }),
          ...(expectedFuelEfficiency && { expectedFuelEfficiency: parseFloat(expectedFuelEfficiency) }),
          ...(photo !== undefined && { photo }),
        },
      });

      res.json(updated);
    } catch (error) {
      console.error("Error al actualizar vehículo:", error);
      res.status(500).json({ error: "Error al actualizar vehículo" });
    }
  },

  // Eliminar vehículo (borrado lógico)
  async delete(req, res) {
    try {
      const { id } = req.params;

      const vehicle = await req.prisma.vehicle.findUnique({
        where: { id: parseInt(id) },
      });

      if (!vehicle || vehicle.active === 0) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
      }

      await req.prisma.vehicle.update({
        where: { id: parseInt(id) },
        data: { active: 0 },
      });

      res.json({ message: "Vehículo eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar vehículo:", error);
      res.status(500).json({ error: "Error al eliminar vehículo" });
    }
  },

  // Obtener estadísticas de un vehículo
  async getStats(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await req.prisma.vehicle.findUnique({
        where: { id: parseInt(id) },
        include: { fuelLogs: { where: { active: 1 } } },
      });

      if (!vehicle || vehicle.active === 0) {
        return res.status(404).json({ error: "Vehículo no encontrado" });
      }

      const fuelLogs = vehicle.fuelLogs;

      // Calcular estadísticas
      let totalLiters = 0;
      let totalCost = 0;
      let totalKilometers = 0;
      let realFuelEfficiency = null;
      let costPerKilometer = null;
      let lastMileage = null;

      if (fuelLogs.length > 0) {
        // Ordenar por fecha
        const sortedLogs = fuelLogs.sort((a, b) => new Date(a.fuelDate) - new Date(b.fuelDate));

        totalLiters = fuelLogs.reduce((sum, log) => sum + log.litersLoaded, 0);
        totalCost = fuelLogs.reduce((sum, log) => sum + log.costTotal, 0);

        // Calcular kilómetros recorridos
        if (sortedLogs.length > 1) {
          lastMileage = sortedLogs[sortedLogs.length - 1].currentMileage;
          const firstMileage = sortedLogs[0].currentMileage;
          totalKilometers = lastMileage - firstMileage;

          if (totalLiters > 0) {
            realFuelEfficiency = totalKilometers / totalLiters;
            costPerKilometer = totalCost / totalKilometers;
          }
        }
      }

      // Detectar si está gastando más de lo esperado
      const isOverConsuming = realFuelEfficiency && realFuelEfficiency < vehicle.expectedFuelEfficiency;

      res.json({
        vehicleId: vehicle.id,
        totalFuelLoads: fuelLogs.length,
        totalLiters,
        totalCost,
        totalKilometers,
        realFuelEfficiency: realFuelEfficiency ? realFuelEfficiency.toFixed(2) : null,
        expectedFuelEfficiency: vehicle.expectedFuelEfficiency,
        isOverConsuming,
        costPerKilometer: costPerKilometer ? costPerKilometer.toFixed(4) : null,
        lastMileage,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
      res.status(500).json({ error: "Error al obtener estadísticas" });
    }
  },
};
