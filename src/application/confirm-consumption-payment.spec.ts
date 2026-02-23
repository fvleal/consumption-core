import { Consumption, ConsumptionStatus } from "@domain/consumption";
import { createConsumptionRepositoryMock } from "@test/mocks/create-consumption-repository-mock";
import { ConfirmConsumptionPaymentUseCase } from "@application/confirm-consumption-payment";

import { ConsumptionNotFoundError } from "./errors/consumption-not-found.error";
import { ConsumptionAlreadyPaidError } from "@domain/consumption.errors";

describe("ConfirmConsumptionPaymentUseCase", () => {
  let repository = createConsumptionRepositoryMock();

  beforeEach(() => {
    repository = createConsumptionRepositoryMock();
  });

  function buildRegisteredConsumption() {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "product-1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.register();

    return consumption;
  }

  it("deve confirmar pagamento quando consumo estiver OVERDUE", async () => {
    const consumption = buildRegisteredConsumption();

    consumption.markAsOverdue();

    repository.findById.mockResolvedValue(consumption);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await useCase.execute({
      consumptionId: consumption.id,
      paymentReference: "ref",
    });

    expect(consumption.status).toBe(ConsumptionStatus.PAID);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("deve confirmar pagamento quando consumo estiver PENDING", async () => {
    const consumption = buildRegisteredConsumption();

    repository.findById.mockResolvedValue(consumption);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await useCase.execute({
      consumptionId: consumption.id,
      paymentReference: "ref",
    });

    expect(consumption.status).toBe(ConsumptionStatus.PAID);
    expect(repository.save).toHaveBeenCalledTimes(1);
  });

  it("deve lançar NotFoundException quando consumo não existir", async () => {
    repository.findById.mockResolvedValue(null);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await expect(
      useCase.execute({
        consumptionId: "invalid",
        paymentReference: "ref",
      }),
    ).rejects.toBeInstanceOf(ConsumptionNotFoundError);

    expect(repository.save).not.toHaveBeenCalled();
  });

  it("deve lançar ConflictException quando consumo já estiver pago", async () => {
    const consumption = buildRegisteredConsumption();

    consumption.markAsPaid("ref");

    repository.findById.mockResolvedValue(consumption);

    const useCase = new ConfirmConsumptionPaymentUseCase(repository);

    await expect(
      useCase.execute({
        consumptionId: consumption.id,
        paymentReference: "ref",
      }),
    ).rejects.toBeInstanceOf(ConsumptionAlreadyPaidError);

    expect(repository.save).not.toHaveBeenCalled();
  });
});
