import { ExceptionBase } from "@libs/exceptions";

export class ConsumptionNotFoundError extends ExceptionBase {
  static readonly message = "Consumption not found";

  public readonly code = "CONSUMPTION.NOT_FOUND";

  constructor(metadata?: unknown) {
    super(ConsumptionNotFoundError.message, undefined, metadata);
  }
}
