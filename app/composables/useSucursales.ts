export interface Sucursal {
  _id?: string;
  nombre: string;
  codigo_establecimiento?: number;
  punto_emision?: number;
  secuencia_factura?: number;
  secuencia_anulacion?: number;
  ambiente: "DEV" | "PROD";
}

export const AMBIENTE_OPTIONS = [
  { label: "Prueba", value: "DEV" },
  { label: "Producción", value: "PROD" },
];

export function useSucursales() {
  const api = useApi();
  const toast = useToast();

  const getAll = async (): Promise<Sucursal[]> => {
    const res = await api.get("/sucursal");
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  };

  const getById = async (id: string): Promise<Sucursal> => {
    const res = await api.get(`/sucursal/${id}`);
    return res.data?.data ?? res.data;
  };

  const create = async (sucursal: Omit<Sucursal, "_id">) => {
    try {
      const res = await api.post("/sucursal", sucursal);
      toast.add({ title: "Sucursal creada correctamente", color: "success" });
      return res.data?.data ?? res.data;
    } catch (error: any) {
      toast.add({
        title: "Error al crear sucursal",
        description: error.response?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  const update = async (id: string, sucursal: Partial<Sucursal>) => {
    try {
      const res = await api.put(`/sucursal/update/${id}`, sucursal);
      toast.add({ title: "Sucursal actualizada", color: "success" });
      return res.data?.data ?? res.data;
    } catch (error: any) {
      toast.add({
        title: "Error al actualizar",
        description: error.response?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await api.post(`/sucursal/delete/${id}`);
      toast.add({ title: "Sucursal eliminada", color: "success" });
    } catch (error: any) {
      toast.add({
        title: "Error al eliminar",
        description: error.response?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  return { getAll, getById, create, update, remove };
}
