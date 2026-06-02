import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { fuelService, vehicleService } from "../../services/api.js";

export const FuelLogsPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    litersLoaded: "",
    costTotal: "",
    currentMileage: "",
    gasStation: "",
    driver: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      loadFuelLogs(selectedVehicle);
    } else {
      loadAllFuelLogs();
    }
  }, [selectedVehicle]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await vehicleService.getAll();
      setVehicles(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFuelLogs = async (vehicleId) => {
    try {
      const data = await fuelService.getAll(vehicleId);
      setFuelLogs(data);
    } catch (err) {
      console.error("Error loading fuel logs:", err);
    }
  };

  const loadAllFuelLogs = async () => {
    try {
      const data = await fuelService.getAll();
      setFuelLogs(data);
    } catch (err) {
      console.error("Error loading fuel logs:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.litersLoaded || !formData.costTotal || formData.currentMileage === "") {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Vehículo, litros, costo y kilometraje son obligatorios",
      });
      return;
    }

    try {
      const payload = {
        vehicleId: parseInt(formData.vehicleId),
        litersLoaded: parseFloat(formData.litersLoaded),
        costTotal: parseFloat(formData.costTotal),
        currentMileage: parseFloat(formData.currentMileage),
        gasStation: formData.gasStation || null,
        driver: formData.driver || null,
        notes: formData.notes || null,
      };

      if (editingId) {
        await fuelService.update(editingId, payload);
        Swal.fire("Actualizado", "Registro actualizado correctamente", "success");
      } else {
        await fuelService.create(payload);
        Swal.fire("Registrado", "Combustible registrado correctamente", "success");
      }

      loadFuelLogs(selectedVehicle || null);
      resetForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleId: "",
      litersLoaded: "",
      costTotal: "",
      currentMileage: "",
      gasStation: "",
      driver: "",
      notes: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (log) => {
    setFormData({
      vehicleId: log.vehicleId.toString(),
      litersLoaded: log.litersLoaded.toString(),
      costTotal: log.costTotal.toString(),
      currentMileage: log.currentMileage.toString(),
      gasStation: log.gasStation || "",
      driver: log.driver || "",
      notes: log.notes || "",
    });
    setEditingId(log.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        await fuelService.delete(id);
        Swal.fire("Eliminado", "Registro eliminado correctamente", "success");
        loadFuelLogs(selectedVehicle || null);
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">⛽ Control de Combustible</h1>
          <p className="text-gray-600 mt-1">Registra y controla el gasto de combustible de tus vehículos</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Registrar Combustible
        </button>
      </div>

      {/* Filtro por vehículo */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por vehículo:</label>
        <select
          value={selectedVehicle || ""}
          onChange={(e) => setSelectedVehicle(e.target.value ? parseInt(e.target.value) : null)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Ver todos los vehículos</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} ({v.licensePlate})
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de registros */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {fuelLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay registros de combustible. ¡Agrega uno para comenzar!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehículo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Litros</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">km/L</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Gasolinera</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Chofer</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {fuelLogs.map((log) => {
                const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(log.fuelDate).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">{log.litersLoaded.toFixed(2)} L</td>
                    <td className="px-4 py-3 text-right text-green-600 font-medium">${log.costTotal.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">-</td>
                    <td className="px-4 py-3 text-gray-600">{log.gasStation || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{log.driver || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? "✏️ Editar Registro" : "➕ Registrar Combustible"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo *</label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un vehículo</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.licensePlate})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Litros *</label>
                  <input
                    type="number"
                    name="litersLoaded"
                    value={formData.litersLoaded}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo Total *</label>
                  <input
                    type="number"
                    name="costTotal"
                    value={formData.costTotal}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje Actual *</label>
                <input
                  type="number"
                  name="currentMileage"
                  value={formData.currentMileage}
                  onChange={handleInputChange}
                  step="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gasolinera (opcional)</label>
                <input
                  type="text"
                  name="gasStation"
                  value={formData.gasStation}
                  onChange={handleInputChange}
                  placeholder="Nombre de la gasolinera"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chofer (opcional)</label>
                <input
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  placeholder="Nombre del chofer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Observaciones"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  {editingId ? "Actualizar" : "Registrar"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
