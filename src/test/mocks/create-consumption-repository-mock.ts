import { ConsumptionRepositoryPort } from "@ports/consumption-repository-port";

export function createConsumptionRepositoryMock(): jest.Mocked<ConsumptionRepositoryPort> {
  return {
    findById: jest.fn(),
    save: jest.fn(),
  };
}
