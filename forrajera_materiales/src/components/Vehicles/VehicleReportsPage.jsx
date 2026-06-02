import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { fuelService, vehicleService, maintenanceService } from "../../services/api.js";

export const VehicleReportsPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleStats, setVehicleStats] = useState(null);
  const [expensesByVehicle, setExpensesByVehicle] = useState(null);
  const [maintenanceSummary, setMaintenanceSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadVehicles();
    loadReports();
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedVehicle) {
      loadVehicleStats();
    }
  }, [selectedVehicle]);

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    }
  };

  const loadVehicleStats = async () => {
    try {
      setIsLoading(true);
      const stats = await vehicleService.getStats(selectedVehicle);
      setVehicleStats(stats);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const [expenses, maintenance] = await Promise.all([
        fuelService.getExpensesByVehicle(selectedMonth),
        maintenanceService.getSummary(selectedMonth),
      ]);
      setExpensesByVehicle(expenses);
      setMaintenanceSummary(maintenance);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (isLoading && !expensesByVehicle) {
    return <div className="flex items-center justify-center h-screen">Cargando reportes...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">📊 Reportes de Vehículos</h1>
        <p className="text-gray-600 mt-1">Análisis de gasto de combustible y mantenimiento</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehículo específico:</label>
          <select
            value={selectedVehicle || ""}
            onChange={(e) => setSelectedVehicle(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Ver todos los vehículos</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.licensePlate})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mes:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Estadísticas de vehículo individual */}
      {selectedVehicle && vehicleStats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Estadísticas del Vehículo</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Total de Cargas</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{vehicleStats.totalFuelLoads}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Total de Litros</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{vehicleStats.totalLiters}</p>
              <p className="text-xs text-gray-600 mt-1">L</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Gasto Total</p>
              <p className="text-3xl font-bold text-red-600 mt-2">${vehicleStats.totalCost.toFixed(2)}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 font-medium">Costo por km</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">${vehicleStats.costPerKilometer}</p>
            </div>
          </div>

          {/* Rendimiento */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`border-2 rounded-lg p-4 ${vehicleStats.isOverConsuming ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}>
              <p className="text-sm font-medium text-gray-700">Rendimiento Real</p>
              <p className={`text-2xl font-bold mt-2 ${vehicleStats.isOverConsuming ? "text-red-600" : "text-green-600"}`}>
                {vehicleStats.realFuelEfficiency} km/L
              </p>
              <p className="text-xs mt-1">Esperado: {vehicleStats.expectedFuelEfficiency} km/L</p>
              {vehicleStats.isOverConsuming && (
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Está gastando más de lo esperado ({((vehicleStats.expectedFuelEfficiency - vehicleStats.realFuelEfficiency) / vehicleStats.expectedFuelEfficiency * 100).toFixed(1)}%)
                </p>
              )}
            </div>

            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <p className="text-sm font-medium text-gray-700">Distancia Recorrida</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{vehicleStats.totalKilometers.toFixed(0)} km</p>
              <p className="text-xs text-gray-600 mt-1">Desde {vehicleStats.totalKilometers > 0 ? "la primera carga" : "sin historial"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Gráfica de Gasto por Vehículo */}
      {expensesByVehicle && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 Gasto de Combustible por Vehículo - {new Date(selectedMonth.split('-')[0], parseInt(selectedMonth.split('-')[1]) - 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</h2>

          {expensesByVehicle.data.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros de combustible para este período</p>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={expensesByVehicle.data.map((v) => ({
                    name: v.vehicle.substring(0, 20),
                    costo: parseFloat(v.totalCost),
                    litros: parseFloat(v.totalLiters),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="costo" fill="#ef4444" name="Costo Total ($)" />
                </BarChart>
              </ResponsiveContainer>

              {/* Tabla de detalles */}
              <div className="mt-8 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Vehículo</th>
                      <th className="px-4 py-2 text-right font-semibold">Litros</th>
                      <th className="px-4 py-2 text-right font-semibold">Costo Total</th>
                      <th className="px-4 py-2 text-right font-semibold">Costo/L</th>
                      <th className="px-4 py-2 text-center font-semibold">Cargas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {expensesByVehicle.data.map((v, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <span className="font-medium text-gray-900">{v.vehicle}</span>
                          <br />
                          <span className="text-xs text-gray-600">{v.licensePlate}</span>
                        </td>
                        <td className="px-4 py-2 text-right">{v.totalLiters} L</td>
                        <td className="px-4 py-2 text-right font-bold text-red-600">${v.totalCost}</td>
                        <td className="px-4 py-2 text-right">${v.costPerLiter}</td>
                        <td className="px-4 py-2 text-center">{v.fuelLoads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Resumen */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <p className="text-sm text-gray-600">Total Gasto</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    ${expensesByVehicle.data.reduce((sum, v) => sum + parseFloat(v.totalCost), 0).toFixed(2)}
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-green-50">
                  <p className="text-sm text-gray-600">Total Litros</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {expensesByVehicle.data.reduce((sum, v) => sum + parseFloat(v.totalLiters), 0).toFixed(2)} L
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                  <p className="text-sm text-gray-600">Vehículos</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{expensesByVehicle.vehicleCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reporte de Mantenimiento */}
      {maintenanceSummary && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🔧 Resumen de Mantenimiento - {new Date(selectedMonth.split('-')[0], parseInt(selectedMonth.split('-')[1]) - 1).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}</h2>

          {maintenanceSummary.totalRecords === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay registros de mantenimiento para este período</p>
          ) : (
            <div className="space-y-4">
              {/* Tarjetas de resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
                  <p className="text-sm text-gray-600 font-medium">Total Registros</p>
                  <p className="text-3xl font-bold text-purple-600 mt-2">{maintenanceSummary.totalRecords}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-red-50">
                  <p className="text-sm text-gray-600 font-medium">Gasto Total</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">${maintenanceSummary.totalCost}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-orange-50">
                  <p className="text-sm text-gray-600 font-medium">Costo Promedio</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">${maintenanceSummary.averageCostPerService}</p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                  <p className="text-sm text-gray-600 font-medium">Tipos de Servicio</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{Object.keys(maintenanceSummary.byServiceType).length}</p>
                </div>
              </div>

              {/* Tabla de servicios */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose por Tipo de Servicio</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold">Tipo de Servicio</th>
                        <th className="px-4 py-2 text-center font-semibold">Cantidad</th>
                        <th className="px-4 py-2 text-right font-semibold">Costo Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {Object.entries(maintenanceSummary.byServiceType).map(([service, data]) => (
                        <tr key={service} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">{service}</td>
                          <td className="px-4 py-2 text-center">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                              {data.count}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-right font-bold text-red-600">
                            ${data.totalCost.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
