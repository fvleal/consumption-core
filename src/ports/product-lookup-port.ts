interface ProductData {
  id: string;
  price: number;
}

export interface ProductLookupPort {
  findById(productId: string): Promise<ProductData | null>;
}
