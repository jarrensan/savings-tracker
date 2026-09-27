import { z } from 'zod';
import currency from 'currency.js';
import { CurrencyCode, CurrencyCodeSchema } from '../types/common';

export const MoneySchema = z.object({
  amount: z.number().finite(),
  currency: CurrencyCodeSchema.default('SGD'),
});
export type MoneyProps = z.infer<typeof MoneySchema>;

export class Money {
  private readonly _amount: number;
  private readonly _currency: CurrencyCode;

  constructor(amount: number, currencyCode: CurrencyCode = 'SGD') {
    const validated = MoneySchema.parse({ amount, currency: currencyCode });
    // Use currency.js to eliminate IEEE 754 floating-point errors
    this._amount = currency(validated.amount, { precision: 2 }).value;
    this._currency = validated.currency;
  }

  get amount(): number {
    return this._amount;
  }

  get currency(): CurrencyCode {
    return this._currency;
  }

  static from(amount: number, currencyCode: CurrencyCode = 'SGD'): Money {
    return new Money(amount, currencyCode);
  }

  static zero(currencyCode: CurrencyCode = 'SGD'): Money {
    return new Money(0, currencyCode);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    const result = currency(this._amount).add(other.amount).value;
    return new Money(result, this._currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    const result = currency(this._amount).subtract(other.amount).value;
    return new Money(result, this._currency);
  }

  multiply(factor: number): Money {
    const result = currency(this._amount).multiply(factor).value;
    return new Money(result, this._currency);
  }

  abs(): Money {
    return new Money(Math.abs(this._amount), this._currency);
  }

  negate(): Money {
    return new Money(-this._amount, this._currency);
  }

  isZero(): boolean {
    return this._amount === 0;
  }

  isPositive(): boolean {
    return this._amount > 0;
  }

  isNegative(): boolean {
    return this._amount < 0;
  }

  equals(other: Money): boolean {
    return this._currency === other.currency && this._amount === other.amount;
  }

  convertTo(targetCurrency: CurrencyCode, exchangeRate: number): Money {
    if (exchangeRate <= 0) {
      throw new Error(`Exchange rate must be positive, received: ${exchangeRate}`);
    }
    const converted = currency(this._amount).multiply(exchangeRate).value;
    return new Money(converted, targetCurrency);
  }

  format(): string {
    return `${this._currency} ${this._amount.toFixed(2)}`;
  }

  toJSON(): MoneyProps {
    return {
      amount: this._amount,
      currency: this._currency,
    };
  }

  private assertSameCurrency(other: Money): void {
    if (this._currency !== other.currency) {
      throw new Error(
        `Currency mismatch: cannot perform arithmetic between ${this._currency} and ${other.currency}. Explicit conversion required.`,
      );
    }
  }
}
