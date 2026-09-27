import { describe, it, expect } from 'vitest';
import { Money } from '../value-objects/Money';

describe('Money Value Object', () => {
  it('should create valid Money with default SGD', () => {
    const money = new Money(50.25);
    expect(money.amount).toBe(50.25);
    expect(money.currency).toBe('SGD');
    expect(money.format()).toBe('SGD 50.25');
  });

  it('should eliminate floating-point precision errors (0.1 + 0.2 === 0.3)', () => {
    const m1 = new Money(0.1);
    const m2 = new Money(0.2);
    const sum = m1.add(m2);
    expect(sum.amount).toBe(0.3);
  });

  it('should correctly add and subtract same currency', () => {
    const a = new Money(100.5, 'SGD');
    const b = new Money(49.25, 'SGD');

    expect(a.add(b).amount).toBe(149.75);
    expect(a.subtract(b).amount).toBe(51.25);
  });

  it('should throw an error when adding different currencies', () => {
    const sgd = new Money(100, 'SGD');
    const usd = new Money(50, 'USD');

    expect(() => sgd.add(usd)).toThrowError(/Currency mismatch/);
  });

  it('should convert currency with exchange rate', () => {
    const usd = new Money(100, 'USD');
    const sgd = usd.convertTo('SGD', 1.35);

    expect(sgd.amount).toBe(135);
    expect(sgd.currency).toBe('SGD');
  });

  it('should reject invalid amounts via Zod', () => {
    expect(() => new Money(NaN)).toThrow();
    expect(() => new Money(Infinity)).toThrow();
  });
});
