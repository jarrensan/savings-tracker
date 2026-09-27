import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import {
  AccountType,
  AccountTypeSchema,
  CurrencyCode,
  CurrencyCodeSchema,
  Institution,
  InstitutionSchema,
} from '../types/common';

export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Account name cannot be empty'),
  institution: InstitutionSchema,
  type: AccountTypeSchema,
  accountNumberMask: z.string().nullable().default(null),
  currency: CurrencyCodeSchema.default('SGD'),
  currentBalance: z.number().default(0),
  color: z.string().default('#3b82f6'),
  isActive: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type AccountProps = z.infer<typeof AccountSchema>;

export interface CreateAccountParams {
  id?: string;
  name: string;
  institution: Institution;
  type: AccountType;
  accountNumberMask?: string | null;
  currency?: CurrencyCode;
  currentBalance?: number;
  color?: string;
  isActive?: boolean;
}

export class Account {
  private props: AccountProps;

  constructor(props: AccountProps) {
    this.props = AccountSchema.parse(props);
  }

  static create(params: CreateAccountParams): Account {
    return new Account({
      id: params.id ?? uuidv4(),
      name: params.name,
      institution: params.institution,
      type: params.type,
      accountNumberMask: params.accountNumberMask ?? null,
      currency: params.currency ?? 'SGD',
      currentBalance: params.currentBalance ?? 0,
      color: params.color ?? '#3b82f6',
      isActive: params.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get institution(): Institution {
    return this.props.institution;
  }

  get type(): AccountType {
    return this.props.type;
  }

  get accountNumberMask(): string | null {
    return this.props.accountNumberMask;
  }

  get currency(): CurrencyCode {
    return this.props.currency;
  }

  get currentBalance(): number {
    return this.props.currentBalance;
  }

  get color(): string {
    return this.props.color;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  matchesMask(mask: string): boolean {
    if (!this.props.accountNumberMask || !mask) return false;
    // Clean any whitespace, asterisks, or dashes
    const cleanSelf = this.props.accountNumberMask.replace(/[\s*-]/g, '');
    const cleanTarget = mask.replace(/[\s*-]/g, '');
    return cleanSelf.endsWith(cleanTarget) || cleanTarget.endsWith(cleanSelf);
  }

  adjustBalance(delta: number): void {
    this.props.currentBalance += delta;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  toProps(): AccountProps {
    return { ...this.props };
  }
}
