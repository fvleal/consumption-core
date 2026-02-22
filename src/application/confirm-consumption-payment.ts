import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";

export interface ConfirmConsumptionPaymentInput {
  consumptionId: string;
  paymentReference: string;
}

export class ConfirmConsumptionPaymentUseCase {
  constructor(
    private readonly consumptionRepository: ConsumptionRepositoryPort,
  ) {}

  async execute(input: ConfirmConsumptionPaymentInput): Promise<void> {
    const consumption = await this.consumptionRepository.findById(
      input.consumptionId,
    );

    if (!consumption) {
      throw new Error("Consumption not found");
    }

    if (!input.paymentReference) {
      throw new Error("paymentReference is required");
    }

    if (consumption.status !== "PENDING" && consumption.status !== "OVERDUE") {
      throw new Error("Payment has already been confirmed");
    }

    consumption.markAsPaid(input.paymentReference);

    await this.consumptionRepository.save(consumption);
  }
}
