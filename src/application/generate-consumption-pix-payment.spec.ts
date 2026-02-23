import { Consumption, ConsumptionStatus } from "@domain/consumption";
import { ConsumptionNotFoundError } from "./errors/consumption-not-found.error";
import { ConsumptionDoesNotBelongToCustomerError } from "./errors/consumption-does-not-belong-to-customer.error";
import { InvalidTotalAmountError } from "@domain/consumption.errors";
import { CustomerNotFoundError } from "./errors/customer-not-found.error";
import { GenerateConsumptionPixPaymentUseCase } from "./generate-consumption-pix-payment";
import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";
import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { PixPaymentPort } from "@ports/pix-payment-port";

describe("GenerateConsumptionPixPaymentUseCase", () => {
  let consumptionRepository: jest.Mocked<ConsumptionRepositoryPort>;
  let customerLookup: jest.Mocked<CustomerLookupPort>;
  let pixPaymentPort: jest.Mocked<PixPaymentPort>;
  let useCase: GenerateConsumptionPixPaymentUseCase;

  beforeEach(() => {
    consumptionRepository = {
      findById: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<ConsumptionRepositoryPort>;

    customerLookup = {
      findById: jest.fn(),
      exists: jest.fn(),
      findByCPF: jest.fn(),
    } as jest.Mocked<CustomerLookupPort>;

    pixPaymentPort = {
      generateQrCode: jest.fn(),
    } as jest.Mocked<PixPaymentPort>;

    useCase = new GenerateConsumptionPixPaymentUseCase(
      consumptionRepository,
      customerLookup,
      pixPaymentPort,
    );
  });

  const buildConsumption = (overrides?: {
    customerId?: string;
    status?: ConsumptionStatus;
    totalAmount?: number;
  }) => {
    const consumption = Consumption.create(
      overrides?.customerId ?? "customer-1",
    );

    if ((overrides?.totalAmount ?? 100) > 0) {
      consumption.addItem({
        productId: "prod-1",
        quantity: 1,
        unitPrice: overrides?.totalAmount ?? 100,
      });
    }

    if (overrides?.status === ConsumptionStatus.PAID) {
      consumption.markAsPaid("ref");
    }

    return consumption;
  };

  it("deve gerar o pagamento via Pix com sucesso", async () => {
    consumptionRepository.findById.mockResolvedValue(buildConsumption());

    customerLookup.findById.mockResolvedValue({
      id: "customer-1",
      fullName: "John Doe",
      cpf: "12345678900",
    });

    pixPaymentPort.generateQrCode.mockResolvedValue({
      paymentId: "payment-1",
      qrCode: "qr-code",
    });

    const result = await useCase.execute({
      consumptionIds: ["cons-1"],
    });

    expect(result).toEqual({
      amount: 100,
      paymentId: "payment-1",
      qrCode: "qr-code",
    });

    expect(pixPaymentPort.generateQrCode).toHaveBeenCalledTimes(1);
  });

  it("deve lançar ConsumptionNotFoundError quando a consumação não for encontrada", async () => {
    consumptionRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ consumptionIds: ["cons-1"] }),
    ).rejects.toBeInstanceOf(ConsumptionNotFoundError);
  });

  it("deve lançar ConsumptionDoesNotBelongToCustomerError quando as consumações pertencerem a clientes diferentes", async () => {
    consumptionRepository.findById
      .mockResolvedValueOnce(buildConsumption({ customerId: "c1" }))
      .mockResolvedValueOnce(buildConsumption({ customerId: "c2" }));

    await expect(
      useCase.execute({ consumptionIds: ["1", "2"] }),
    ).rejects.toBeInstanceOf(ConsumptionDoesNotBelongToCustomerError);
  });

  it("deve lançar InvalidTotalAmountError quando o valor total for menor ou igual a zero", async () => {
    consumptionRepository.findById.mockResolvedValue(
      buildConsumption({ totalAmount: 0 }),
    );

    await expect(
      useCase.execute({ consumptionIds: ["1"] }),
    ).rejects.toBeInstanceOf(InvalidTotalAmountError);
  });

  it("deve lançar CustomerNotFoundError quando o cliente não for encontrado", async () => {
    consumptionRepository.findById.mockResolvedValue(buildConsumption());

    customerLookup.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ consumptionIds: ["1"] }),
    ).rejects.toBeInstanceOf(CustomerNotFoundError);
  });

  it("deve lançar ArgumentInvalidException quando forem fornecidos consumos duplicados", async () => {
    await expect(
      useCase.execute({
        consumptionIds: ["cons-1", "cons-1"],
      }),
    ).rejects.toThrow("Duplicated consumption ids are not allowed");

    expect(consumptionRepository.findById).not.toHaveBeenCalled();
  });
});
