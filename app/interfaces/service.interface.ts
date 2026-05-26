export interface Service {
    id: string | number;
    sku?: string;
    url?: string;
    title: string;
    description: string;
    longDescription?: string;
    price: number;
    image: string[];
    category: string;
    badge?: string;
    features?: string[];
    slug?: string;
    isApplyPay?: boolean;
    isApplyAddress?: boolean;
    isApplyIva?: boolean;
}

