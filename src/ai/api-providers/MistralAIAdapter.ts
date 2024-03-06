import axios, { AxiosError } from 'axios';
import { AIProvidable, PayloadProps, Role } from './api.type';
import { logger } from 'src/logger';

export class MistralAIAdapter implements AIProvidable {
  private readonly chatRole: Role = 'user';
  private readonly chatCompletionUrl: string = 'https://api.mistral.ai/v1/chat/completions';

  constructor(
    private apiKey: string,
    private modelId: string
  ) {}

  public async query(query: string): Promise<string> {
    const payload = this.buildPayload(query);

    try {
      const { data: { choices: [ { message: { content } } ] } } = await axios.post(this.chatCompletionUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return content?.trim() || '';
    } catch (error: any | AxiosError) {
      console.error('MistralAiAdapter Error:', axios.isAxiosError(error) ? error?.response?.data?.message : error.message);
      throw new Error('Error processing AI query');
    }
  }

  public getModel(): string {
    return this.modelId;
  }

  public buildPayload(query: string): PayloadProps {
    const payload = {
      model: this.modelId,
      messages: [{ role: this.chatRole, content: query }],
    };

    return payload;
  }
}
