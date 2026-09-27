import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Money, MoneyProps } from '../value-objects/Money';
import {
  CurrencyCode,
  TransactionSource,
  TransactionSourceSchema,
  TransactionStatus,
  TransactionStatusSchema,
  TransactionType,
  TransactionTypeSchema,
} from '../types/common';

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  accountId: z.string().uuid().nullable().default(null),
  amount: z.number().finite().refine((val) => val !== 0, {
    message: 'Transaction amount cannot be zero',
  }),
  currency: z.string().default('SGD'),
  type: TransactionTypeSchema,
  rawDescription: z.string().min(1, 'Raw description cannot be empty'),
  cleanMerchant: z.string().min(1, 'Clean merchant cannot be empty'),
  categoryId: z.string().uuid().nullable().default(null),
  notes: z.string().nullable().default(null),
  tags: z.array(z.string()).default([]),
  status: TransactionStatusSchema.default('SETTLED'),
  source: TransactionSourceSchema.default('EMAIL_ALERT'),
  referenceId: z.string().nullable().default(null),
  transferPairId: z.string().uuid().nullable().default(null),
  transactionDate: z.date(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type TransactionProps = z.infer<typeof TransactionSchema>;

export interface CreateTransactionParams {
  id?: string;
  accountId?: string | null;
  amount: number;
  currency?: CurrencyCode;
  type: TransactionType;
  rawDescription: string;
  cleanMerchant: string;
  categoryId?: string | null;
  notes?: string | null;
  tags?: string[];
  status?: TransactionStatus;
  source?: TransactionSource;
  referenceId?: string | null;
  transferPairId?: string | null;
  transactionDate: Date;
  metadata?: Record<string, unknown>;
}

export class Transaction {
  private props: TransactionProps;
  private _money: Money;

  constructor(props: TransactionProps) {
    this.props = TransactionSchema.parse(props);
    this._money = new Money(this.props.amount, this.props.currency as CurrencyCode);
  }

  static create(params: CreateTransactionParams): Transaction {
    // Invariant: Enforce signs based on transaction type
    let normalizedAmount = params.amount;
    if (params.type === 'EXPENSE' && normalizedAmount > 0) {
      normalizedAmount = -normalizedAmount; // Expenses are negative cash outflow
    } else if (params.type === 'INCOME' && normalizedAmount < 0) {
      normalizedAmount = Math.abs(normalizedAmount); // Income is positive cash inflow
    }

    return new Transaction({
      id: params.id ?? uuidv4(),
      accountId: params.accountId ?? null,
      amount: normalizedAmount,
      currency: params.currency ?? 'SGD',
      type: params.type,
      rawDescription: params.rawDescription,
      cleanMerchant: params.cleanMerchant,
      categoryId: params.categoryId ?? null,
      notes: params.notes ?? null,
      tags: params.tags ?? [],
      status: params.status ?? 'SETTLED',
      source: params.source ?? 'EMAIL_ALERT',
      referenceId: params.referenceId ?? null,
      transferPairId: params.transferPairId ?? null,
      transactionDate: params.transactionDate,
      metadata: params.metadata ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get accountId(): string | null {
    return this.props.accountId;
  }

  get money(): Money {
    return this._money;
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): CurrencyCode {
    return this._money.currency;
  }

  get type(): TransactionType {
    return this.props.type;
  }

  get rawDescription(): string {
    return this.props.rawDescription;
  }

  get cleanMerchant(): string {
    return this.props.cleanMerchant;
  }

  get categoryId(): string | null {
    return this.props.categoryId;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get tags(): string[] {
    return [...this.props.tags];
  }

  get status(): TransactionStatus {
    return this.props.status;
  }

  get source(): TransactionSource {
    return this.props.source;
  }

  get referenceId(): string | null {
    return this.props.referenceId;
  }

  get transferPairId(): string | null {
    return this.props.transferPairId;
  }

  get transactionDate(): Date {
    return this.props.transactionDate;
  }

  get metadata(): Record<string, unknown> {
    return { ...this.props.metadata };
  }

  isExpense(): boolean {
    return this.props.type === 'EXPENSE';
  }

  isIncome(): boolean {
    return this.props.type === 'INCOME';
  }

  isTransfer(): boolean {
    return this.props.type === 'TRANSFER';
  }

  assignCategory(categoryId: string): void {
    this.props.categoryId = categoryId;
    this.props.updatedAt = new Date();
  }

  linkTransfer(pairedTransactionId: string): void {
    this.props.transferPairId = pairedTransactionId;
    this.props.type = 'TRANSFER';
    this.props.updatedAt = new Date();
  }

  updateNotes(notes: string | null): void {
    this.props.notes = notes;
    this.props.updatedAt = new Date();
  }

  addTag(tag: string): void {
    const clean = tag.trim().toLowerCase();
    if (!this.props.tags.includes(clean)) {
      this.props.tags.push(clean);
      this.props.updatedAt = new Date();
    }
  }

  removeTag(tag: string): void {
    const clean = tag.trim().toLowerCase();
    this.props.tags = this.props.tags.filter((t) => t !== clean);
    this.props.updatedAt = new Date();
  }

  markSettled(): void {
    this.props.status = 'SETTLED';
    this.props.updatedAt = new Date();
  }

  toProps(): TransactionProps {
    return { ...this.props };
  }
}
