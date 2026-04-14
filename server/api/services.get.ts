import servicesData from '~~/app/template/services_list.json';

export default defineEventHandler(async (event) => {
    // Flatten the categorized data into a single array for the frontend
    const allServices = Object.values(servicesData).flat();
    return allServices;
})
