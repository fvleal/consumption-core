import { ExceptionBase } from "@libs/exceptions";

export class ConsumptionDoesNotBelongToCustomerError extends ExceptionBase {
  static readonly message =
    "Consumption does not belong to the specified customer";

  public readonly code = "CONSUMPTION.CUSTOMER_MISMATCH";

  constructor(metadata?: unknown) {
    super(ConsumptionDoesNotBelongToCustomerError.message, undefined, metadata);
  }
}
