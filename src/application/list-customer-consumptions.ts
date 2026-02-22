import { ConsumptionQueryPort } from "@ports/consumption-query-port";

export interface ListCustomerConsumptionsInput {
  customerId: string;
}

export interface ListCustomerConsumptionsOutput {
  id: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: Date;
}

export class ListCustomerConsumptionsUseCase {
  constructor(private readonly consumptionQuery: ConsumptionQueryPort) {}

  async execute(
    input: ListCustomerConsumptionsInput,
  ): Promise<ListCustomerConsumptionsOutput[]> {
    if (!input.customerId) {
      throw new Error("CustomerId is required");
    }

    const consumptions = await this.consumptionQuery.findByCustomerId(
      input.customerId,
    );

    return consumptions.map((consumption) => ({
      id: consumption.id,
      totalAmount: consumption.totalAmount,
      status: consumption.status,
      createdAt: consumption.createdAt,
    }));
  }
}
