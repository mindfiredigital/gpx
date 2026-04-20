export interface JsonOutput<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: number; message: string };
}
