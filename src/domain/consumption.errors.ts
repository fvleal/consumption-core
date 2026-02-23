import { ExceptionBase } from "@libs/exceptions";

export class InvalidTotalAmountError extends ExceptionBase {
  static readonly message = "Total amount must be greater than zero";

  public readonly code = "CONSUMPTION.INVALID_TOTAL_AMOUNT";

  constructor(metadata?: unknown) {
    super(InvalidTotalAmountError.message, undefined, metadata);
  }
}

export class ConsumptionAlreadyPaidError extends ExceptionBase {
  static readonly message = "Consumption are already paid";

  public readonly code = "CONSUMPTION.ALREADY_PAID";

  constructor(metadata?: unknown) {
    super(ConsumptionAlreadyPaidError.message, undefined, metadata);
  }
}
