import { NotFoundException } from "@libs/exceptions";

export class ProductNotFoundError extends NotFoundException {
  static readonly code = "PRODUCT.NOT_FOUND";

  constructor(productId: string) {
    super(`Product ${productId} not found`);
  }
}
