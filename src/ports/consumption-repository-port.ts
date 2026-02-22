import { Consumption } from "@domain/consumption";

export interface ConsumptionRepositoryPort {
  save(consumption: Consumption): Promise<void>;
  findById(id: string): Promise<Consumption | null>;
}
