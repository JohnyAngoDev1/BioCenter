export interface Testimonials {
  user: {
    name: string;
    description: string;
    avatar: {
      src: string;
      alt: string;
    };
  };
  quote: string;
  rate: number;
}
