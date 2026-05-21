export interface Producto {
  _id?: string;
  sku?: string;
  url?: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  image?: string;
  category: string;
  badge?: string;
  features?: string[];
  isApplyPay?: boolean;
  isApplyAddress?: boolean;
  isApplyIva?: boolean;
}

export function useProductos() {
  const api = useApi();
  const toast = useToast();

  const getAll = async (): Promise<Producto[]> => {
    const res = await api.get("/producto");
    return res.data?.data ?? res.data;
  };

  const getById = async (id: string): Promise<Producto> => {
    const res = await api.get(`/producto/${id}`);
    return res.data?.data ?? res.data;
  };

  const create = async (producto: Omit<Producto, "_id">) => {
    try {
      const res = await api.post("/producto", producto);
      toast.add({ title: "Producto creado correctamente", color: "success" });
      return res.data?.data ?? res.data;
    } catch (error: any) {
      toast.add({
        title: "Error al crear producto",
        description: error.response?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  const update = async (id: string, producto: Partial<Producto>) => {
    try {
      const res = await api.put(`/producto/update/${id}`, producto);
      toast.add({ title: "Producto actualizado", color: "success" });
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
      await api.post(`/producto/delete/${id}`);
      toast.add({ title: "Producto eliminado", color: "success" });
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
