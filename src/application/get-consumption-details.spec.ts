import { ConsumptionDetailsQueryPort } from "@ports/consumption-details-query-port";
import { GetConsumptionDetailsUseCase } from "@application/get-consumption-details";

describe("GetConsumptionDetailsUseCase", () => {
  let query: jest.Mocked<ConsumptionDetailsQueryPort>;

  beforeEach(() => {
    query = {
      findById: jest.fn(),
    };
  });

  it("Deve retornar os detalhes do consumo quando existir", async () => {
    const now = new Date();

    query.findById.mockResolvedValue({
      id: "consumption-1",
      customerId: "customer-1",
      totalAmount: 30,
      status: "PENDING",
      createdAt: now,
      items: [
        {
          productId: "product-1",
          quantity: 2,
          unitPrice: 10,
          total: 20,
        },
        {
          productId: "product-2",
          quantity: 1,
          unitPrice: 10,
          total: 10,
        },
      ],
    });

    const useCase = new GetConsumptionDetailsUseCase(query);

    const result = await useCase.execute({
      consumptionId: "consumption-1",
    });

    expect(query.findById).toHaveBeenCalledWith("consumption-1");
    expect(result.totalAmount).toBe(30);
    expect(result.items.length).toBe(2);
  });

  it("Deve lançar erro quando consumptionId não for informado", async () => {
    const useCase = new GetConsumptionDetailsUseCase(query);

    await expect(useCase.execute({ consumptionId: "" })).rejects.toThrow(
      "ConsumptionId is required",
    );

    expect(query.findById).not.toHaveBeenCalled();
  });

  it("Deve lançar erro quando consumo não existir", async () => {
    query.findById.mockResolvedValue(null);

    const useCase = new GetConsumptionDetailsUseCase(query);

    await expect(useCase.execute({ consumptionId: "invalid" })).rejects.toThrow(
      "Consumption not found",
    );

    expect(query.findById).toHaveBeenCalledTimes(1);
  });
});
