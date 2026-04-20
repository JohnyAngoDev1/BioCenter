import servicesData from '~~/app/template/services_list.json';

export default defineEventHandler(async (event) => {
    const allServices = Object.values(servicesData).flat().map(service => {
        // Generar un slug a partir del título (ej: "Suero Detox Profundo" -> "suero-detox-profundo")
        const slug = service.title
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // eliminar tildes
            .replace(/[^a-z0-9]+/g, '-') // reemplazar espacios o caracteres raros por guión
            .replace(/(^-|-$)+/g, ''); // quitar guiones de los bordes
        return { ...service, slug };
    });
    return allServices;
})
