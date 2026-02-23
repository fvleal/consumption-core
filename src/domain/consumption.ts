import { randomUUID } from "node:crypto";
import {
  ArgumentNotProvidedException,
  ArgumentOutOfRangeException,
  ConflictException,
} from "@libs/exceptions";
import { ConsumptionAlreadyPaidError } from "./consumption.errors";

export enum ConsumptionStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
}

interface ConsumptionItemProps {
  productId: string;
  quantity: number;
  unitPrice: number;
}

class ConsumptionItem {
  private readonly _productId: string;
  private readonly _quantity: number;
  private readonly _unitPrice: number;

  constructor(props: ConsumptionItemProps) {
    if (!props.productId) {
      throw new ArgumentNotProvidedException("productId is required");
    }

    if (!Number.isFinite(props.quantity) || props.quantity <= 0) {
      throw new ArgumentOutOfRangeException(
        "quantity must be a positive number",
      );
    }

    if (!Number.isFinite(props.unitPrice) || props.unitPrice < 0) {
      throw new ArgumentOutOfRangeException(
        "unitPrice must be zero or positive",
      );
    }

    this._productId = props.productId;
    this._quantity = props.quantity;
    this._unitPrice = props.unitPrice;
  }

  get productId(): string {
    return this._productId;
  }

  get quantity(): number {
    return this._quantity;
  }

  get unitPrice(): number {
    return this._unitPrice;
  }

  get total(): number {
    return this._quantity * this._unitPrice;
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
      throw new ArgumentNotProvidedException("customerId is required");
    }

    this._id = randomUUID();
    this._customerId = customerId;
    this._createdAt = new Date();
    this._status = ConsumptionStatus.DRAFT;
    this._items = [];
  }

  static create(customerId: string): Consumption {
    return new Consumption(customerId);
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
    this.ensureIsDraft();

    if (this._items.some((i) => i.productId === props.productId)) {
      throw new ConflictException("Product already added to consumption");
    }

    const item = new ConsumptionItem(props);
    this._items.push(item);
  }

  register(): void {
    this.ensureIsDraft();
    this.ensureHasItems();
    this.ensureTotalIsPositive();

    this._status = ConsumptionStatus.PENDING;
  }

  markAsPaid(paymentReference: string): void {
    if (!paymentReference) {
      throw new ArgumentNotProvidedException("paymentReference is required");
    }

    if (this._status === ConsumptionStatus.PAID) {
      throw new ConsumptionAlreadyPaidError();
    }

    if (
      this._status !== ConsumptionStatus.PENDING &&
      this._status !== ConsumptionStatus.OVERDUE
    ) {
      throw new ConflictException(
        "Only pending or overdue consumption can be paid",
      );
    }

    if (this.totalAmount <= 0) {
      throw new ConflictException("Cannot pay consumption with zero total");
    }

    this._paymentReference = paymentReference;
    this._paidAt = new Date();
    this._status = ConsumptionStatus.PAID;
  }

  markAsOverdue(): void {
    if (this._status !== ConsumptionStatus.PENDING) {
      throw new ConflictException(
        "Only pending consumption can become overdue",
      );
    }

    this._status = ConsumptionStatus.OVERDUE;
  }

  private ensureIsDraft(): void {
    if (this._status !== ConsumptionStatus.DRAFT) {
      throw new ConflictException("Only draft consumption can be modified");
    }
  }

  private ensureHasItems(): void {
    if (this._items.length === 0) {
      throw new ArgumentOutOfRangeException(
        "Consumption must contain at least one item",
      );
    }
  }

  private ensureTotalIsPositive(): void {
    if (!Number.isFinite(this.totalAmount) || this.totalAmount <= 0) {
      throw new ArgumentOutOfRangeException(
        "Consumption total must be greater than zero",
      );
    }
  }
}
