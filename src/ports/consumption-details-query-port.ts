export interface ConsumptionItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ConsumptionDetailsData {
  id: string;
  customerId: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: Date;
  items: ConsumptionItemData[];
}

export interface ConsumptionDetailsQueryPort {
  findById(id: string): Promise<ConsumptionDetailsData | null>;
}
