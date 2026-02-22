interface ProductData {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export interface ProductCatalogPort {
  listAvailable(): Promise<ProductData[]>;
}
