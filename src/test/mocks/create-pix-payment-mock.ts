import { PixPaymentPort } from "@ports/pix-payment-port";

export function createPixPaymentMock(): jest.Mocked<PixPaymentPort> {
  return {
    generateQrCode: jest.fn(),
  };
}
