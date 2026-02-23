import { ListCustomerConsumptionsUseCase } from "@application/list-customer-consumptions";
import { ConsumptionQueryPort } from "@ports/consumption-query-port";

describe("ListCustomerConsumptionsUseCase", () => {
  let query: jest.Mocked<ConsumptionQueryPort>;

  beforeEach(() => {
    query = {
      findByCustomerId: jest.fn(),
    };
  });

  it("Deve listar consumos do cliente", async () => {
    query.findByCustomerId.mockResolvedValue([
      {
        id: "c1",
        customerId: "customer-1",
        totalAmount: 20,
        status: "PENDING",
        createdAt: new Date(),
      },
    ]);

    const useCase = new ListCustomerConsumptionsUseCase(query);

    const result = await useCase.execute({
      customerId: "customer-1",
    });

    expect(result.length).toBe(1);
    expect(result[0].id).toBe("c1");
  });
});
