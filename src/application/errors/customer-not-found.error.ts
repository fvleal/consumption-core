import { ExceptionBase } from "@libs/exceptions";

export class CustomerNotFoundError extends ExceptionBase {
  static readonly message = "Customer not found";

  public readonly code = "CUSTOMER.NOT_FOUND";

  constructor(metadata?: unknown) {
    super(CustomerNotFoundError.message, undefined, metadata);
  }
}
