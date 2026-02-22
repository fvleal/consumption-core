import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { PixPaymentPort } from "@ports/pix-payment-port";

interface GenerateConsumptionPixPaymentInput {
  consumptionIds: string[];
}

interface GenerateConsumptionPixPaymentOutput {
  qrCode: string;
  paymentId: string;
  amount: number;
}

export class GenerateConsumptionPixPaymentUseCase {
  constructor(
    private readonly consumptionRepository: ConsumptionRepositoryPort,
    private readonly customerLookup: CustomerLookupPort,
    private readonly pixPaymentPort: PixPaymentPort,
  ) {}

  async execute(
    input: GenerateConsumptionPixPaymentInput,
  ): Promise<GenerateConsumptionPixPaymentOutput> {
    if (!input.consumptionIds || input.consumptionIds.length === 0) {
      throw new Error("At least one consumption is required");
    }

    const consumptions = await Promise.all(
      input.consumptionIds.map((id) => this.consumptionRepository.findById(id)),
    );

    if (consumptions.some((c) => !c)) {
      throw new Error("One or more consumptions not found");
    }

    const validConsumptions = consumptions as NonNullable<
      (typeof consumptions)[number]
    >[];

    const firstCustomerId = validConsumptions[0].customerId;

    if (!validConsumptions.every((c) => c.customerId === firstCustomerId)) {
      throw new Error("Consumptions must belong to the same customer");
    }

    if (validConsumptions.some((c) => c.status === "PAID")) {
      throw new Error("One or more consumptions are already paid");
    }

    const totalAmount = validConsumptions.reduce(
      (acc, c) => acc + c.totalAmount,
      0,
    );

    if (totalAmount <= 0) {
      throw new Error("Total amount must be greater than zero");
    }

    const customer = await this.customerLookup.findById(firstCustomerId);

    if (!customer) {
      throw new Error("Customer not found");
    }

    const payment = await this.pixPaymentPort.generateQrCode({
      referenceId: input.consumptionIds.join("-"),
      amount: totalAmount,
      description: `Pagamento consolidado`,
      payer: {
        fullName: customer.fullName,
        cpf: customer.cpf,
      },
    });

    return {
      amount: totalAmount,
      paymentId: payment.paymentId,
      qrCode: payment.qrCode,
    };
  }
}
