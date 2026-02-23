import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { ConsumptionNotFoundError } from "./errors/consumption-not-found.error";

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
      throw new ConsumptionNotFoundError();
    }

    consumption.markAsPaid(input.paymentReference);

    await this.consumptionRepository.save(consumption);
  }
}
