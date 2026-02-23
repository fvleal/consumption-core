import { Consumption, ConsumptionStatus } from "@domain/consumption";
import { ConsumptionAlreadyPaidError } from "./consumption.errors";

describe("Consumption Aggregate", () => {
  it("Deve criar consumo com status DRAFT", () => {
    const consumption = Consumption.create("customer-123");

    expect(consumption.id).toBeDefined();
    expect(typeof consumption.id).toBe("string");

    expect(consumption.customerId).toBe("customer-123");
    expect(consumption.status).toBe(ConsumptionStatus.DRAFT);
    expect(consumption.createdAt).toBeInstanceOf(Date);
    expect(consumption.items).toEqual([]);
    expect(consumption.totalAmount).toBe(0);
  });

  it("Deve lançar erro quando customerId não for informado", () => {
    expect(() => Consumption.create("")).toThrow("customerId is required");
  });

  it("Deve adicionar item enquanto estiver em DRAFT", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 2,
      unitPrice: 10,
    });

    expect(consumption.totalAmount).toBe(20);
    expect(consumption.items.length).toBe(1);
  });

  it("Não deve permitir adicionar item duplicado", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    expect(() =>
      consumption.addItem({
        productId: "p1",
        quantity: 2,
        unitPrice: 5,
      }),
    ).toThrow("Product already added to consumption");
  });

  it("Deve lançar erro quando productId não for informado", () => {
    const consumption = Consumption.create("customer-1");

    expect(() =>
      consumption.addItem({
        productId: "",
        quantity: 1,
        unitPrice: 10,
      }),
    ).toThrow("productId is required");
  });

  it("Deve lançar erro quando quantity for inválido", () => {
    const consumption = Consumption.create("customer-1");

    expect(() =>
      consumption.addItem({
        productId: "p1",
        quantity: 0,
        unitPrice: 10,
      }),
    ).toThrow("quantity must be a positive number");
  });

  it("Deve lançar erro quando unitPrice for negativo", () => {
    const consumption = Consumption.create("customer-1");

    expect(() =>
      consumption.addItem({
        productId: "p1",
        quantity: 1,
        unitPrice: -1,
      }),
    ).toThrow("unitPrice must be zero or positive");
  });

  it("Deve registrar consumo e mudar status para PENDING", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.register();

    expect(consumption.status).toBe(ConsumptionStatus.PENDING);
  });

  it("Não deve registrar consumo sem itens", () => {
    const consumption = Consumption.create("customer-1");

    expect(() => consumption.register()).toThrow(
      "Consumption must contain at least one item",
    );
  });

  it("Não deve permitir modificar após registro", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.register();

    expect(() =>
      consumption.addItem({
        productId: "p2",
        quantity: 1,
        unitPrice: 5,
      }),
    ).toThrow("Only draft consumption can be modified");
  });

  it("Deve marcar consumo como pago", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.register();
    consumption.markAsPaid("payment-ref");

    expect(consumption.status).toBe(ConsumptionStatus.PAID);
  });

  it("Não deve permitir pagar duas vezes", async () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.register();
    consumption.markAsPaid("payment-ref");

    expect(() => consumption.markAsPaid("payment-ref")).toThrow(
      ConsumptionAlreadyPaidError,
    );
  });

  it("Deve lançar erro se não fornecer paymentReference", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.register();

    expect(() => consumption.markAsPaid("")).toThrow(
      "paymentReference is required",
    );
  });

  it("Deve marcar consumo como vencido quando estiver PENDING", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.register();
    consumption.markAsOverdue();

    expect(consumption.status).toBe(ConsumptionStatus.OVERDUE);
  });

  it("Não deve permitir marcar como vencido fora de PENDING", () => {
    const consumption = Consumption.create("customer-1");

    expect(() => consumption.markAsOverdue()).toThrow(
      "Only pending consumption can become overdue",
    );
  });
});
