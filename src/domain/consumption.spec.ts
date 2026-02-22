import { Consumption } from "@domain/consumption";

describe("Consumption Aggregate", () => {
  it("Deve criar consumo com dados iniciais íntegros", () => {
    const consumption = Consumption.create("customer-123");

    expect(consumption.id).toBeDefined();
    expect(typeof consumption.id).toBe("string");

    expect(consumption.customerId).toBe("customer-123");

    expect(consumption.status).toBe("PENDING");

    expect(consumption.createdAt).toBeInstanceOf(Date);

    expect(consumption.items).toEqual([]);
    expect(consumption.totalAmount).toBe(0);
  });

  it("Deve criar consumo com status PENDING", () => {
    const consumption = Consumption.create("customer-1");

    expect(consumption.status).toBe("PENDING");
    expect(consumption.totalAmount).toBe(0);
  });

  it("Deve lançar erro quando customerId não for informado", () => {
    expect(() => Consumption.create("")).toThrow("customerId is required");
  });

  it("Deve adicionar item ao consumo", () => {
    const consumption = Consumption.create("customer-1");

    consumption.addItem({
      productId: "p1",
      quantity: 2,
      unitPrice: 10,
    });

    expect(consumption.totalAmount).toBe(20);
  });

  it("Deve lançar erro ao adicionar item quando não estiver pendente", () => {
    const consumption = Consumption.create("customer-1");
    consumption.markAsOverdue();

    expect(() =>
      consumption.addItem({
        productId: "p1",
        quantity: 1,
        unitPrice: 10,
      }),
    ).toThrow("Consumption is not pending");
  });

  it("Deve lançar erro ao pagar consumo já pago", () => {
    const consumption = Consumption.create("customer-1");
    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.markAsPaid("ref");

    expect(() => consumption.markAsPaid("ref")).toThrow(
      "Consumption already paid",
    );
  });

  it("Deve lançar erro ao pagar consumo sem valor", () => {
    const consumption = Consumption.create("customer-1");

    expect(() => consumption.markAsPaid("")).toThrow(
      "Cannot pay a consumption with zero value",
    );
  });

  it("Deve lançar erro ao marcar consumo pago como vencido", () => {
    const consumption = Consumption.create("customer-1");
    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 10,
    });

    consumption.markAsPaid("ref");

    expect(() => consumption.markAsOverdue()).toThrow(
      "Cannot mark paid consumption as overdue",
    );
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

  it("Deve lançar erro quando quantity for menor ou igual a zero", () => {
    const consumption = Consumption.create("customer-1");

    expect(() =>
      consumption.addItem({
        productId: "p1",
        quantity: 0,
        unitPrice: 10,
      }),
    ).toThrow("quantity must be greater than zero");
  });

  it("Deve permitir unitPrice menor ou igual a zero", () => {
    const consumption = Consumption.create("customer-1");
    consumption.addItem({
      productId: "p1",
      quantity: 1,
      unitPrice: 0,
    });

    expect(consumption.totalAmount).toBe(0);
  });
});
