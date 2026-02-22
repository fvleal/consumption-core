import { ProductCatalogPort } from "@ports/product-catalog-port";
import { ListAvailableProductsUseCase } from "@application/list-available-products";

describe("ListAvailableProductsUseCase", () => {
  let productCatalog: jest.Mocked<ProductCatalogPort>;

  beforeEach(() => {
    productCatalog = {
      listAvailable: jest.fn(),
    };
  });

  it("Deve listar apenas produtos ativos", async () => {
    productCatalog.listAvailable.mockResolvedValue([
      { id: "1", name: "Café", price: 5, active: true },
      { id: "2", name: "Suco", price: 7, active: false },
    ]);

    const useCase = new ListAvailableProductsUseCase(productCatalog);

    const result = await useCase.execute();

    expect(result).toEqual([{ id: "1", name: "Café", price: 5 }]);
  });

  it("Deve retornar lista vazia quando não houver produtos", async () => {
    productCatalog.listAvailable.mockResolvedValue([]);

    const useCase = new ListAvailableProductsUseCase(productCatalog);

    const result = await useCase.execute();

    expect(result).toEqual([]);
  });
});
