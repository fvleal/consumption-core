import { Consumption } from "@domain/consumption";
import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { ProductLookupPort } from "@ports/product-lookup-port";

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
      throw new Error("Customer not found");
    }

    if (input.items.length === 0) {
      throw new Error("At least one item is required");
    }

    const consumption = Consumption.create(input.customerId);

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error("Quantity must be greater than zero");
      }

      const product = await this.productLookup.findById(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      consumption.addItem({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    await this.consumptionRepository.save(consumption);

    return {
      consumptionId: consumption.id,
      totalAmount: consumption.totalAmount,
      status: consumption.status,
    };
  }
}
