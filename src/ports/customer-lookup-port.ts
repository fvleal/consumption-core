interface CustomerData {
  id: string;
  fullName: string;
  cpf: string;
}

export interface CustomerLookupPort {
  exists(customerId: string): Promise<boolean>;
  findById(customerId: string): Promise<CustomerData | null>;
  findByCPF(cpf: string): Promise<CustomerData | null>;
}
