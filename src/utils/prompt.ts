import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

export const ask = async (question: string): Promise<string> => {
  const rl = createInterface({ input, output });

  try {
    const response = await rl.question(question);
    return response.trim();
  } finally {
    rl.close();
  }
};
