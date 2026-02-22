interface PixPayer {
  fullName: string;
  cpf: string;
}

interface GeneratePixQrCodeRequest {
  referenceId: string;
  amount: number;
  description: string;
  payer: PixPayer;
}

interface GeneratePixQrCodeResponse {
  qrCode: string;
  paymentId: string;
}

export interface PixPaymentPort {
  generateQrCode(
    request: GeneratePixQrCodeRequest,
  ): Promise<GeneratePixQrCodeResponse>;
}
