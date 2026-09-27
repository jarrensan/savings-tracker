import { describe, it, expect } from 'vitest';
import { Transaction } from '../entities/Transaction';

describe('Transaction Entity (Aggregate Root)', () => {
  it('should enforce negative amount for EXPENSE', () => {
    const tx = Transaction.create({
      amount: 45.5, // Passed as positive
      type: 'EXPENSE',
      rawDescription: 'GRAB* A-12345',
      cleanMerchant: 'Grab',
      transactionDate: new Date('2026-09-26T12:00:00Z'),
    });

    expect(tx.amount).toBe(-45.5);
    expect(tx.isExpense()).toBe(true);
    expect(tx.isIncome()).toBe(false);
  });

  it('should enforce positive amount for INCOME', () => {
    const tx = Transaction.create({
      amount: -3000, // Passed as negative
      type: 'INCOME',
      rawDescription: 'SALARY CREDIT TECH CO',
      cleanMerchant: 'Tech Co',
      transactionDate: new Date('2026-09-26T12:00:00Z'),
    });

    expect(tx.amount).toBe(3000);
    expect(tx.isIncome()).toBe(true);
  });

  it('should reject zero amount via Zod validation', () => {
    expect(() =>
      Transaction.create({
        amount: 0,
        type: 'EXPENSE',
        rawDescription: 'ZERO SPEND',
        cleanMerchant: 'Test',
        transactionDate: new Date(),
      }),
    ).toThrow();
  });

  it('should link transfer correctly', () => {
    const tx = Transaction.create({
      amount: -500,
      type: 'EXPENSE',
      rawDescription: 'PAYNOW TO IBKR',
      cleanMerchant: 'IBKR',
      transactionDate: new Date(),
    });

    const mockPairedId = '11111111-1111-1111-1111-111111111111';
    tx.linkTransfer(mockPairedId);

    expect(tx.isTransfer()).toBe(true);
    expect(tx.transferPairId).toBe(mockPairedId);
  });

  it('should handle tags without duplicates', () => {
    const tx = Transaction.create({
      amount: -25,
      type: 'EXPENSE',
      rawDescription: 'TOKYO DINING',
      cleanMerchant: 'Tokyo Dining',
      transactionDate: new Date(),
    });

    tx.addTag('#japan-trip');
    tx.addTag('#japan-trip'); // Duplicate
    tx.addTag('#vacation');

    expect(tx.tags).toEqual(['#japan-trip', '#vacation']);

    tx.removeTag('#japan-trip');
    expect(tx.tags).toEqual(['#vacation']);
  });
});
