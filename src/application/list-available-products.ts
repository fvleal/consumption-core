import { ProductCatalogPort } from "@ports/product-catalog-port";

export interface ListAvailableProductsOutput {
  id: string;
  name: string;
  price: number;
}

export class ListAvailableProductsUseCase {
  constructor(private readonly productCatalog: ProductCatalogPort) {}

  async execute(): Promise<ListAvailableProductsOutput[]> {
    const products = await this.productCatalog.listAvailable();

    return products
      .filter((product) => product.active)
      .map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
      }));
  }
}
