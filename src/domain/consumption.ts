import { randomUUID } from "node:crypto";

export type ConsumptionStatus = "PENDING" | "PAID" | "OVERDUE";

interface ConsumptionItemProps {
  productId: string;
  quantity: number;
  unitPrice: number;
}

class ConsumptionItem {
  constructor(private readonly props: ConsumptionItemProps) {
    if (!props.productId) {
      throw new Error("productId is required");
    }

    if (props.quantity <= 0) {
      throw new Error("quantity must be greater than zero");
    }
  }

  get total(): number {
    return this.props.quantity * this.props.unitPrice;
  }
}

export class Consumption {
  private readonly _id: string;
  private readonly _customerId: string;
  private readonly _createdAt: Date;
  private _status: ConsumptionStatus;
  private _items: ConsumptionItem[];
  private _paidAt?: Date;
  private _paymentReference?: string;

  private constructor(customerId: string) {
    if (!customerId) {
      throw new Error("customerId is required");
    }

    this._id = randomUUID();
    this._customerId = customerId;
    this._createdAt = new Date();
    this._status = "PENDING";
    this._items = [];
  }

  static create(custumerId: string): Consumption {
    return new Consumption(custumerId);
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this._customerId;
  }

  get status(): ConsumptionStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get items(): ReadonlyArray<ConsumptionItem> {
    return [...this._items];
  }

  get totalAmount(): number {
    return this._items.reduce((acc, item) => acc + item.total, 0);
  }

  addItem(props: ConsumptionItemProps): void {
    this.ensureIsPending();

    const item = new ConsumptionItem(props);
    this._items.push(item);
  }

  markAsPaid(paymentReference: string): void {
    if (this._status === "PAID") {
      throw new Error("Consumption already paid");
    }

    if (this.totalAmount <= 0) {
      throw new Error("Cannot pay a consumption with zero value");
    }

    this._paymentReference = paymentReference;
    this._status = "PAID";
  }

  markAsOverdue(): void {
    if (this._status === "PAID") {
      throw new Error("Cannot mark paid consumption as overdue");
    }

    this._status = "OVERDUE";
  }

  private ensureIsPending(): void {
    if (this._status !== "PENDING") {
      throw new Error("Consumption is not pending");
    }
  }
}
