export interface Producto {
  _id?: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  image?: string;
  category: string;
  badge?: string;
  features?: string[];
}

export function useProductos() {
  const toast = useToast();

  const getAll = () => $fetch<Producto[]>("/api/productos");

  const getById = (id: string) => $fetch<Producto>(`/api/productos/${id}`);

  const create = async (producto: Omit<Producto, "_id">) => {
    try {
      const data = await $fetch<Producto>("/api/productos", {
        method: "POST",
        body: producto,
      });
      toast.add({ title: "Producto creado correctamente", color: "success" });
      return data;
    } catch (error: any) {
      toast.add({
        title: "Error al crear producto",
        description: error?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  const update = async (id: string, producto: Partial<Producto>) => {
    try {
      const data = await $fetch<Producto>(`/api/productos/${id}`, {
        method: "PUT",
        body: producto,
      });
      toast.add({ title: "Producto actualizado", color: "success" });
      return data;
    } catch (error: any) {
      toast.add({
        title: "Error al actualizar",
        description: error?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await $fetch(`/api/productos/${id}`, { method: "DELETE" });
      toast.add({ title: "Producto eliminado", color: "success" });
    } catch (error: any) {
      toast.add({
        title: "Error al eliminar",
        description: error?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  return { getAll, getById, create, update, remove };
}
