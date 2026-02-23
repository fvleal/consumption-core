import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { createCustomerLookupMock } from "@test/mocks/create-customer-lookup-mock";
import { IdentifyCustomerUseCase } from "@application/identify-customer";

describe("IdentifyCustomerUseCase", () => {
  let customerLookup: jest.Mocked<CustomerLookupPort>;

  beforeEach(() => {
    customerLookup = createCustomerLookupMock();
  });

  it("Deve identificar cliente pelo CPF quando existir", async () => {
    customerLookup.findByCPF.mockResolvedValue({
      id: "customer-1",
      fullName: "João Silva",
      cpf: "12345678900",
    });

    const useCase = new IdentifyCustomerUseCase(customerLookup);

    const result = await useCase.execute({
      cpf: "12345678900",
    });

    expect(customerLookup.findByCPF).toHaveBeenCalledWith("12345678900");
    expect(result).toEqual({
      id: "customer-1",
      fullName: "João Silva",
      cpf: "12345678900",
    });
  });

  it("Deve lançar erro quando cliente não existir", async () => {
    customerLookup.findByCPF.mockResolvedValue(null);

    const useCase = new IdentifyCustomerUseCase(customerLookup);

    await expect(useCase.execute({ cpf: "00000000000" })).rejects.toThrow(
      "Customer not found",
    );

    expect(customerLookup.findByCPF).toHaveBeenCalledTimes(1);
  });
});
