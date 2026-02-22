import { CustomerLookupPort } from "@ports/customer-lookup-port";

export function createCustomerLookupMock(): jest.Mocked<CustomerLookupPort> {
  return {
    findById: jest.fn(),
    exists: jest.fn(),
    findByCPF: jest.fn(),
  };
}
