export interface Empresa {
  _id: string;
  razon_social: string;
  nombre_comercial: string;
}

export function useEmpresas() {
  const api = useApi();

  const getAll = async (): Promise<Empresa[]> => {
    const res = await api.get("/empresa");
    const data = res.data?.data ?? res.data;
    return Array.isArray(data) ? data : [];
  };

  return { getAll };
}
