export interface Service {
    id: number;
    title: string;
    description: string;
    longDescription?: string;
    price: number;
    image: string;
    category: string;
    badge?: string;
    features?: string[];
    slug?: string;
}
