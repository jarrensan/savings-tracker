import { z } from 'zod';

export const CurrencyCodeSchema = z.enum([
  'SGD',
  'USD',
  'EUR',
  'GBP',
  'MYR',
  'JPY',
  'CNY',
  'AUD',
  'HKD',
  'NZD',
]);
export type CurrencyCode = z.infer<typeof CurrencyCodeSchema>;

export const InstitutionSchema = z.enum([
  'DBS',
  'SCB',
  'IBKR',
  'CASH',
  'OTHER',
]);
export type Institution = z.infer<typeof InstitutionSchema>;

export const AccountTypeSchema = z.enum([
  'SAVINGS',
  'CHECKING',
  'CREDIT_CARD',
  'INVESTMENT',
  'WALLET',
]);
export type AccountType = z.infer<typeof AccountTypeSchema>;

export const TransactionTypeSchema = z.enum([
  'EXPENSE',
  'INCOME',
  'TRANSFER',
]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

export const TransactionStatusSchema = z.enum([
  'PENDING',
  'SETTLED',
  'RECONCILED',
]);
export type TransactionStatus = z.infer<typeof TransactionStatusSchema>;

export const TransactionSourceSchema = z.enum([
  'EMAIL_ALERT',
  'CSV_IMPORT',
  'MANUAL',
  'IBKR_API',
]);
export type TransactionSource = z.infer<typeof TransactionSourceSchema>;

export const GranularitySchema = z.enum(['daily', 'weekly', 'monthly']);
export type Granularity = z.infer<typeof GranularitySchema>;

export const DateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
}).refine((data) => data.startDate <= data.endDate, {
  message: 'startDate must be before or equal to endDate',
  path: ['endDate'],
});
export type DateRange = z.infer<typeof DateRangeSchema>;
