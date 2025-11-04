import { randomUUID } from 'crypto';

interface SendParams {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface SendResult {
  data: { id: string };
  error: null;
}

export class Resend {
  readonly apiKey: string;
  readonly emails = {
    send: async (params: SendParams): Promise<SendResult> => {
      return {
        data: { id: randomUUID() },
        error: null,
      };
    },
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }
}

export default { Resend };
