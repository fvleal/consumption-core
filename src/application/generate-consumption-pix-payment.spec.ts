import { createConsumptionRepositoryMock } from "@test/mocks/create-consumption-repository-mock";
import { createCustomerLookupMock } from "@test/mocks/create-customer-lookup-mock";
import { createPixPaymentMock } from "@test/mocks/create-pix-payment-mock";
import { GenerateConsumptionPixPaymentUseCase } from "@application/generate-consumption-pix-payment";
import { Consumption } from "@domain/consumption";

describe("GenerateConsumptionPixPaymentUseCase", () => {
  let repository = createConsumptionRepositoryMock();
  let customerLookup = createCustomerLookupMock();
  let pixPort = createPixPaymentMock();

  beforeEach(() => {
    repository = createConsumptionRepositoryMock();
    customerLookup = createCustomerLookupMock();
    pixPort = createPixPaymentMock();
  });

  it("Deve gerar QR Code consolidado quando todos os consumos forem válidos", async () => {
    const c1 = Consumption.create("customer-1");
    c1.addItem({ productId: "p1", quantity: 1, unitPrice: 10 });

    const c2 = Consumption.create("customer-1");
    c2.addItem({ productId: "p2", quantity: 2, unitPrice: 10 });

    repository.findById.mockResolvedValueOnce(c1).mockResolvedValueOnce(c2);

    customerLookup.findById.mockResolvedValue({
      id: "customer-1",
      fullName: "João Silva",
      cpf: "12345678900",
    });

    pixPort.generateQrCode.mockResolvedValue({
      paymentId: "payment-123",
      qrCode: "qr-code-string",
    });

    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    const result = await useCase.execute({
      consumptionIds: [c1.id, c2.id],
    });

    expect(result.amount).toBe(30);
    expect(result.paymentId).toBe("payment-123");
    expect(pixPort.generateQrCode).toHaveBeenCalledTimes(1);
  });

  it("Deve lançar erro quando nenhum consumo for informado", async () => {
    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    await expect(useCase.execute({ consumptionIds: [] })).rejects.toThrow(
      "At least one consumption is required",
    );

    expect(pixPort.generateQrCode).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando algum consumo não existir", async () => {
    repository.findById.mockResolvedValue(null);

    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    await expect(
      useCase.execute({ consumptionIds: ["invalid"] }),
    ).rejects.toThrow("One or more consumptions not found");

    expect(pixPort.generateQrCode).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando consumos pertencerem a clientes diferentes", async () => {
    const c1 = Consumption.create("customer-1");
    c1.addItem({ productId: "p1", quantity: 1, unitPrice: 10 });

    const c2 = Consumption.create("customer-2");
    c2.addItem({ productId: "p2", quantity: 1, unitPrice: 10 });

    repository.findById.mockResolvedValueOnce(c1).mockResolvedValueOnce(c2);

    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    await expect(
      useCase.execute({ consumptionIds: [c1.id, c2.id] }),
    ).rejects.toThrow("Consumptions must belong to the same customer");

    expect(pixPort.generateQrCode).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando algum consumo estiver pago", async () => {
    const c1 = Consumption.create("customer-1");
    c1.addItem({ productId: "p1", quantity: 1, unitPrice: 10 });
    c1.markAsPaid("ref");

    repository.findById.mockResolvedValue(c1);

    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    await expect(useCase.execute({ consumptionIds: [c1.id] })).rejects.toThrow(
      "One or more consumptions are already paid",
    );

    expect(pixPort.generateQrCode).not.toHaveBeenCalled();
  });

  it("Deve permitir gerar cobrança quando consumo estiver vencido", async () => {
    const c1 = Consumption.create("customer-1");
    c1.addItem({ productId: "p1", quantity: 1, unitPrice: 10 });
    c1.markAsOverdue();

    repository.findById.mockResolvedValue(c1);

    customerLookup.findById.mockResolvedValue({
      id: "customer-1",
      fullName: "João Silva",
      cpf: "12345678900",
    });

    pixPort.generateQrCode.mockResolvedValue({
      paymentId: "payment-123",
      qrCode: "qr",
    });

    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    const result = await useCase.execute({
      consumptionIds: [c1.id],
    });

    expect(result.amount).toBe(10);
    expect(pixPort.generateQrCode).toHaveBeenCalledTimes(1);
  });

  it("Deve lançar erro quando o valor total for zero", async () => {
    const c1 = Consumption.create("customer-1");

    repository.findById.mockResolvedValue(c1);

    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    await expect(useCase.execute({ consumptionIds: [c1.id] })).rejects.toThrow(
      "Total amount must be greater than zero",
    );

    expect(pixPort.generateQrCode).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando cliente não for encontrado", async () => {
    const c1 = Consumption.create("customer-1");
    c1.addItem({ productId: "p1", quantity: 1, unitPrice: 10 });

    repository.findById.mockResolvedValue(c1);

    customerLookup.findById.mockResolvedValue(null);

    const useCase = new GenerateConsumptionPixPaymentUseCase(
      repository,
      customerLookup,
      pixPort,
    );

    await expect(useCase.execute({ consumptionIds: [c1.id] })).rejects.toThrow(
      "Customer not found",
    );

    expect(pixPort.generateQrCode).not.toHaveBeenCalled();
  });
});
