export interface CheckResult {
  label: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}
