import { Consumption } from "@domain/consumption";
import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { ProductLookupPort } from "@ports/product-lookup-port";

import { CustomerNotFoundError } from "./errors/customer-not-found.error";
import { ProductNotFoundError } from "./errors/product-not-found.error";

export interface RegisterConsumptionItemInput {
  productId: string;
  quantity: number;
}

export interface RegisterConsumptionInput {
  customerId: string;
  items: RegisterConsumptionItemInput[];
}

export interface RegisterConsumptionOutput {
  consumptionId: string;
  totalAmount: number;
  status: string;
}

export class RegisterConsumptionUseCase {
  constructor(
    private readonly consumptionRepository: ConsumptionRepositoryPort,
    private readonly customerLookup: CustomerLookupPort,
    private readonly productLookup: ProductLookupPort,
  ) {}

  async execute(
    input: RegisterConsumptionInput,
  ): Promise<RegisterConsumptionOutput> {
    const customerExists = await this.customerLookup.exists(input.customerId);

    if (!customerExists) {
      throw new CustomerNotFoundError();
    }

    const consumption = Consumption.create(input.customerId);

    for (const item of input.items) {
      const product = await this.productLookup.findById(item.productId);

      if (!product) {
        throw new ProductNotFoundError(item.productId);
      }

      consumption.addItem({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    consumption.register();

    await this.consumptionRepository.save(consumption);

    return {
      consumptionId: consumption.id,
      totalAmount: consumption.totalAmount,
      status: consumption.status,
    };
  }
}
