import { CustomerLookupPort } from "@ports/customer-lookup-port";

export interface IdentifyCustomerInput {
  cpf: string;
}

export interface IdentifyCustomerOutput {
  id: string;
  fullName: string;
  cpf: string;
}

export class IdentifyCustomerUseCase {
  constructor(private readonly customerLookup: CustomerLookupPort) {}

  async execute(input: IdentifyCustomerInput): Promise<IdentifyCustomerOutput> {
    if (!input.cpf) {
      throw new Error("CPF is required");
    }

    const customer = await this.customerLookup.findByCPF(input.cpf);

    if (!customer) {
      throw new Error("Customer not found");
    }

    return {
      id: customer.id,
      fullName: customer.fullName,
      cpf: customer.cpf,
    };
  }
}
