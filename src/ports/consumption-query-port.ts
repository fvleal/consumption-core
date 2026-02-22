export interface ConsumptionSummaryData {
  id: string;
  customerId: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  createdAt: Date;
}

export interface ConsumptionQueryPort {
  findByCustomerId(customerId: string): Promise<ConsumptionSummaryData[]>;
}
