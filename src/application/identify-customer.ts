import { CustomerLookupPort } from "@ports/customer-lookup-port";
import { CustomerNotFoundError } from "./errors/customer-not-found.error";

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
    const customer = await this.customerLookup.findByCPF(input.cpf);

    if (!customer) {
      throw new CustomerNotFoundError();
    }

    return {
      id: customer.id,
      fullName: customer.fullName,
      cpf: customer.cpf,
    };
  }
}
