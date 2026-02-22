import { Consumption } from "@domain/consumption";
import { createConsumptionRepositoryMock } from "@test/mocks/create-consumption-repository-mock";
import { ConfirmConsumptionPaymentUseCase } from "@application/confirm-consumption-payment";

describe("ConfirmConsumptionPaymentUseCase", () => {
  let repository = createConsumptionRepositoryMock();

  beforeEach(() => {
    repository = createConsumptionRepositoryMock();
  });

  it("Deve confirmar pagamento quando consumo estiver OVERDUE", async () => {
    const consumption = Consumption.create("customer-1");
    consumption.addItem({
      productId: "product-1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.markAsOverdue();

    repository.findById.mockResolvedValue(consumption);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await useCase.execute({
      consumptionId: consumption.id,
      paymentReference: "ref",
    });

    expect(consumption.status).toBe("PAID");
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("Deve confirmar pagamento quando consumo estiver PENDING", async () => {
    const consumption = Consumption.create("customer-1");
    consumption.addItem({
      productId: "product-1",
      quantity: 1,
      unitPrice: 10,
    });

    repository.findById.mockResolvedValue(consumption);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await useCase.execute({
      consumptionId: consumption.id,
      paymentReference: "ref",
    });

    expect(consumption.status).toBe("PAID");
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("Deve lançar erro quando consumo não existir", async () => {
    repository.findById.mockResolvedValue(null);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await expect(
      useCase.execute({
        consumptionId: "invalid",
        paymentReference: "invalid",
      }),
    ).rejects.toThrow("Consumption not found");

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando consumo já estiver pago", async () => {
    const consumption = Consumption.create("customer-1");
    consumption.addItem({
      productId: "product-1",
      quantity: 1,
      unitPrice: 10,
    });
    consumption.markAsPaid("ref");

    repository.findById.mockResolvedValue(consumption);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await expect(
      useCase.execute({
        consumptionId: consumption.id,
        paymentReference: "ref",
      }),
    ).rejects.toThrow("Payment has already been confirmed");

    expect(repository.save).not.toHaveBeenCalled();
  });
});
