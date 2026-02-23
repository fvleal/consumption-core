import { ConsumptionDetailsQueryPort } from "@ports/consumption-details-query-port";

import { ConsumptionNotFoundError } from "./errors/consumption-not-found.error";

export interface GetConsumptionDetailsInput {
  consumptionId: string;
}

export interface GetConsumptionDetailsOutput {
  id: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: Date;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export class GetConsumptionDetailsUseCase {
  constructor(private readonly query: ConsumptionDetailsQueryPort) {}

  async execute(
    input: GetConsumptionDetailsInput,
  ): Promise<GetConsumptionDetailsOutput> {
    const consumption = await this.query.findById(input.consumptionId);

    if (!consumption) {
      throw new ConsumptionNotFoundError();
    }

    return {
      id: consumption.id,
      totalAmount: consumption.totalAmount,
      status: consumption.status,
      createdAt: consumption.createdAt,
      items: consumption.items,
    };
  }
}
