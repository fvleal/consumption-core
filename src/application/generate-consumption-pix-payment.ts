import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { PixPaymentPort } from "@ports/pix-payment-port";
import { ConsumptionNotFoundError } from "./errors/consumption-not-found.error";
import { ConsumptionDoesNotBelongToCustomerError } from "./errors/consumption-does-not-belong-to-customer.error";
import {
  ConsumptionAlreadyPaidError,
  InvalidTotalAmountError,
} from "@domain/consumption.errors";
import { CustomerNotFoundError } from "./errors/customer-not-found.error";
import { ConsumptionStatus } from "@domain/consumption";
import { ArgumentInvalidException } from "@libs/exceptions";

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
    const uniqueIds = new Set(input.consumptionIds);

    if (uniqueIds.size !== input.consumptionIds.length) {
      throw new ArgumentInvalidException(
        "Duplicated consumption ids are not allowed",
      );
    }

    const consumptions = await Promise.all(
      input.consumptionIds.map((id) => this.consumptionRepository.findById(id)),
    );

    const missingIds = input.consumptionIds.filter(
      (_, index) => !consumptions[index],
    );

    if (missingIds.length > 0) {
      throw new ConsumptionNotFoundError({ missingIds });
    }

    const validConsumptions = consumptions as NonNullable<
      (typeof consumptions)[number]
    >[];

    const firstCustomerId = validConsumptions[0].customerId;

    if (!validConsumptions.every((c) => c.customerId === firstCustomerId)) {
      throw new ConsumptionDoesNotBelongToCustomerError();
    }

    if (validConsumptions.some((c) => c.status === ConsumptionStatus.PAID)) {
      throw new ConsumptionAlreadyPaidError();
    }

    const totalAmount = validConsumptions.reduce(
      (acc, c) => acc + c.totalAmount,
      0,
    );

    if (totalAmount <= 0) {
      throw new InvalidTotalAmountError();
    }

    const customer = await this.customerLookup.findById(firstCustomerId);

    if (!customer) {
      throw new CustomerNotFoundError();
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
