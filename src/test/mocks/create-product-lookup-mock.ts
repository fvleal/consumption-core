import { ProductLookupPort } from "@ports/product-lookup-port";

export function createProductLookupMock(): jest.Mocked<ProductLookupPort> {
  return {
    findById: jest.fn(),
  };
}
