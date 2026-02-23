import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { ProductLookupPort } from "@ports/product-lookup-port";

import { createConsumptionRepositoryMock } from "@test/mocks/create-consumption-repository-mock";
import { createCustomerLookupMock } from "@test/mocks/create-customer-lookup-mock";
import { createProductLookupMock } from "@test/mocks/create-product-lookup-mock";

import { RegisterConsumptionUseCase } from "@application/register-consumption";

import { CustomerNotFoundError } from "@application/errors/customer-not-found.error";
import { ProductNotFoundError } from "@application/errors/product-not-found.error";
import { ArgumentOutOfRangeException } from "@libs/exceptions";
import { ConsumptionStatus } from "@domain/consumption";

describe("RegisterConsumptionUseCase", () => {
  let repository: jest.Mocked<ConsumptionRepositoryPort>;
  let customerLookup: jest.Mocked<CustomerLookupPort>;
  let productLookup: jest.Mocked<ProductLookupPort>;
  let useCase: RegisterConsumptionUseCase;

  beforeEach(() => {
    repository = createConsumptionRepositoryMock();
    customerLookup = createCustomerLookupMock();
    productLookup = createProductLookupMock();

    useCase = new RegisterConsumptionUseCase(
      repository,
      customerLookup,
      productLookup,
    );
  });

  it("deve registrar uma ficha de consumo com múltiplos itens quando cliente e produtos existem", async () => {
    customerLookup.exists.mockResolvedValue(true);

    productLookup.findById
      .mockResolvedValueOnce({
        id: "product-1",
        price: 10,
      })
      .mockResolvedValueOnce({
        id: "product-2",
        price: 20,
      });

    const result = await useCase.execute({
      customerId: "customer-1",
      items: [
        { productId: "product-1", quantity: 2 },
        { productId: "product-2", quantity: 1 },
      ],
    });

    expect(result.totalAmount).toBe(40);
    expect(result.status).toBe(ConsumptionStatus.PENDING);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("deve lançar CustomerNotFoundError quando o cliente não existir", async () => {
    customerLookup.exists.mockResolvedValue(false);

    await expect(
      useCase.execute({
        customerId: "invalid",
        items: [{ productId: "product-1", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("deve lançar ArgumentOutOfRangeException quando a lista de itens estiver vazia", async () => {
    customerLookup.exists.mockResolvedValue(true);

    await expect(
      useCase.execute({
        customerId: "customer-1",
        items: [],
      }),
    ).rejects.toBeInstanceOf(ArgumentOutOfRangeException);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("deve lançar ProductNotFoundError quando algum produto não for encontrado", async () => {
    customerLookup.exists.mockResolvedValue(true);
    productLookup.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        customerId: "customer-1",
        items: [{ productId: "invalid-product", quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(ProductNotFoundError);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("deve lançar erro quando a quantidade for menor ou igual a zero", async () => {
    customerLookup.exists.mockResolvedValue(true);

    productLookup.findById.mockResolvedValue({
      id: "product-1",
      price: 10,
    });

    await expect(
      useCase.execute({
        customerId: "customer-1",
        items: [{ productId: "product-1", quantity: 0 }],
      }),
    ).rejects.toThrow();

    expect(repository.save).not.toHaveBeenCalled();
  });
});
