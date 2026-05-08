export interface OrderItem {
  kind: string;
  product_name: string;
  name_snapshot: string;
  image_snapshot: string | null;
  quantity: number;
  unit_price: { $numberDecimal: string };
  total_price: { $numberDecimal: string };
  size: string | null;
  color: string | null;
  gender: string | null;
  delivery_code: string | null;
  delivered_at: string | null;
}

export interface BillingData {
  fullName: string;
  dni: string;
  email: string;
  phone: string;
  main_street: string;
  secondary_street: string;
  house_number: string;
  customerId: string;
  ipAddress: string;
}

export interface Pedido {
  _id: string;
  source_module: string;
  full_name: string;
  document_number: string;
  order_code: string;
  items: OrderItem[];
  subtotal: { $numberDecimal: string };
  iva: { $numberDecimal: string };
  total: { $numberDecimal: string };
  payment_status: string;
  payment_provider: string;
  payment_reference: string;
  payphone_status: string;
  delivery_status: string;
  status?: string;
  billingData: BillingData;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUSES = [
  { value: "pendiente", label: "Pendiente" },
  { value: "procesando", label: "Procesando" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export function usePedidos() {
  const api = useApi();
  const toast = useToast();

  const getAll = async (): Promise<Pedido[]> => {
    const res = await api.get("/order");
    return res.data?.data ?? res.data;
  };

  const getById = async (id: string): Promise<Pedido> => {
    const res = await api.get(`/order/${id}`);
    return res.data?.data ?? res.data;
  };

  const update = async (id: string, status: string) => {
    try {
      const res = await api.put(`/order/${id}`, { status });
      toast.add({ title: "Estado actualizado correctamente", color: "success" });
      return res.data?.data ?? res.data;
    } catch (error: any) {
      toast.add({
        title: "Error al actualizar el estado",
        description: error.response?.data?.message ?? error.message,
        color: "error",
      });
      throw error;
    }
  };

  return { getAll, getById, update };
}
