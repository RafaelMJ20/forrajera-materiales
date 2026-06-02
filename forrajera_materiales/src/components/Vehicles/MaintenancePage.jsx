import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { maintenanceService, vehicleService } from "../../services/api.js";

export const MaintenancePage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    vehicleId: "",
    serviceType: "",
    mileage: "",
    cost: "",
    notes: "",
    nextServiceDate: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      loadMaintenanceLogs(selectedVehicle);
    } else {
      loadAllMaintenanceLogs();
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

  const loadMaintenanceLogs = async (vehicleId) => {
    try {
      const data = await maintenanceService.getAll(vehicleId);
      setMaintenanceLogs(data);
    } catch (err) {
      console.error("Error loading maintenance logs:", err);
    }
  };

  const loadAllMaintenanceLogs = async () => {
    try {
      const data = await maintenanceService.getAll();
      setMaintenanceLogs(data);
    } catch (err) {
      console.error("Error loading maintenance logs:", err);
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

    if (!formData.vehicleId || !formData.serviceType) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Vehículo y tipo de servicio son obligatorios",
      });
      return;
    }

    try {
      const payload = {
        vehicleId: parseInt(formData.vehicleId),
        serviceType: formData.serviceType,
        mileage: formData.mileage ? parseFloat(formData.mileage) : null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        notes: formData.notes || null,
        nextServiceDate: formData.nextServiceDate || null,
      };

      if (editingId) {
        await maintenanceService.update(editingId, payload);
        Swal.fire("Actualizado", "Registro actualizado correctamente", "success");
      } else {
        await maintenanceService.create(payload);
        Swal.fire("Registrado", "Mantenimiento registrado correctamente", "success");
      }

      loadMaintenanceLogs(selectedVehicle || null);
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
      serviceType: "",
      mileage: "",
      cost: "",
      notes: "",
      nextServiceDate: "",
    });
    setEditingId(null);
    setShowModal(false);
  };

  const handleEdit = (log) => {
    setFormData({
      vehicleId: log.vehicleId.toString(),
      serviceType: log.serviceType,
      mileage: log.mileage ? log.mileage.toString() : "",
      cost: log.cost ? log.cost.toString() : "",
      notes: log.notes || "",
      nextServiceDate: log.nextServiceDate ? log.nextServiceDate.split("T")[0] : "",
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
        await maintenanceService.delete(id);
        Swal.fire("Eliminado", "Registro eliminado correctamente", "success");
        loadMaintenanceLogs(selectedVehicle || null);
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
          <h1 className="text-3xl font-bold text-gray-900">🔧 Mantenimiento de Vehículos</h1>
          <p className="text-gray-600 mt-1">Registra y controla el mantenimiento de tu flota</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          ➕ Registrar Mantenimiento
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
        {maintenanceLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay registros de mantenimiento. ¡Agrega uno para comenzar!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Vehículo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo de Servicio</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Kilometraje</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Costo</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Próx. Servicio</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {maintenanceLogs.map((log) => {
                const vehicle = vehicles.find((v) => v.id === log.vehicleId);
                return (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-900 font-medium">
                      {vehicle ? `${vehicle.brand} ${vehicle.model}` : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {log.serviceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(log.maintenanceDate).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {log.mileage ? `${log.mileage.toFixed(0)} km` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">
                      {log.cost ? `$${log.cost.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {log.nextServiceDate
                        ? new Date(log.nextServiceDate).toLocaleDateString("es-ES")
                        : "—"}
                    </td>
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
              {editingId ? "✏️ Editar Registro" : "➕ Registrar Mantenimiento"}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Servicio *</label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona un servicio</option>
                  <option>Cambio de Aceite</option>
                  <option>Cambio de Llantas</option>
                  <option>Inspección General</option>
                  <option>Alineación</option>
                  <option>Revisión de Frenos</option>
                  <option>Mantenimiento Preventivo</option>
                  <option>Reparación</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kilometraje (opcional)</label>
                  <input
                    type="number"
                    name="mileage"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costo (opcional)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Próximo Servicio (opcional)</label>
                <input
                  type="date"
                  name="nextServiceDate"
                  value={formData.nextServiceDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Detalles del servicio"
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
