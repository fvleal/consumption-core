import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { ProductLookupPort } from "@ports/product-lookup-port";
import { createConsumptionRepositoryMock } from "@test/mocks/create-consumption-repository-mock";
import { createCustomerLookupMock } from "@test/mocks/create-customer-lookup-mock";
import { createProductLookupMock } from "@test/mocks/create-product-lookup-mock";
import { RegisterConsumptionUseCase } from "@application/register-consumption";

describe("RegisterConsumptionUseCase", () => {
  let repository: jest.Mocked<ConsumptionRepositoryPort>;
  let customerLookup: jest.Mocked<CustomerLookupPort>;
  let productLookup: jest.Mocked<ProductLookupPort>;

  beforeEach(() => {
    repository = createConsumptionRepositoryMock();

    customerLookup = createCustomerLookupMock();

    productLookup = createProductLookupMock();
  });

  it("Deve registrar uma ficha de consumo com múltiplos itens quando cliente e produtos existem", async () => {
    customerLookup.exists.mockResolvedValue(true);

    productLookup.findById.mockResolvedValue({
      id: "product-1",
      price: 10,
    });

    const useCase = new RegisterConsumptionUseCase(
      repository,
      customerLookup,
      productLookup,
    );

    const result = await useCase.execute({
      customerId: "customer-1",
      items: [
        { productId: "product-1", quantity: 2 },
        { productId: "product-1", quantity: 1 },
      ],
    });

    expect(result.totalAmount).toBe(30);
    expect(result.status).toBe("PENDING");

    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("Deve registrar uma ficha de consumo mesmo com itens gratuitos", async () => {
    customerLookup.exists.mockResolvedValue(true);

    productLookup.findById.mockResolvedValue({
      id: "product-1",
      price: 0,
    });

    const useCase = new RegisterConsumptionUseCase(
      repository,
      customerLookup,
      productLookup,
    );

    const result = await useCase.execute({
      customerId: "customer-1",
      items: [{ productId: "product-1", quantity: 2 }],
    });

    expect(result.totalAmount).toBe(0);
  });

  it("Deve lançar erro quando o cliente não existir", async () => {
    customerLookup.exists.mockResolvedValue(false);

    const useCase = new RegisterConsumptionUseCase(
      repository,
      customerLookup,
      productLookup,
    );

    await expect(
      useCase.execute({
        customerId: "invalid",
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toThrow("Customer not found");

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando a lista de itens estiver vazia", async () => {
    customerLookup.exists.mockResolvedValue(true);

    const useCase = new RegisterConsumptionUseCase(
      repository,
      customerLookup,
      productLookup,
    );

    await expect(
      useCase.execute({
        customerId: "customer-1",
        items: [],
      }),
    ).rejects.toThrow("At least one item is required");

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando algum produto não for encontrado", async () => {
    customerLookup.exists.mockResolvedValue(true);
    productLookup.findById.mockResolvedValue(null);

    const useCase = new RegisterConsumptionUseCase(
      repository,
      customerLookup,
      productLookup,
    );

    await expect(
      useCase.execute({
        customerId: "customer-1",
        items: [{ productId: "invalid-product", quantity: 1 }],
      }),
    ).rejects.toThrow();

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando a quantidade de algum item for menor ou igual a zero", async () => {
    customerLookup.exists.mockResolvedValue(true);

    const useCase = new RegisterConsumptionUseCase(
      repository,
      customerLookup,
      productLookup,
    );

    await expect(
      useCase.execute({
        customerId: "customer-1",
        items: [{ productId: "product-1", quantity: 0 }],
      }),
    ).rejects.toThrow();

    expect(repository.save).not.toHaveBeenCalled();
  });
});
