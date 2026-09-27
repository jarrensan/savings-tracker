import { describe, it, expect } from 'vitest';
import { CashFlowCalculator } from '../services/CashFlowCalculator';
import { Transaction } from '../entities/Transaction';

describe('CashFlowCalculator Domain Service', () => {
  const createTx = (amount: number, type: 'EXPENSE' | 'INCOME' | 'TRANSFER', dateStr: string) =>
    Transaction.create({
      amount,
      type,
      rawDescription: 'TEST',
      cleanMerchant: 'Test',
      transactionDate: new Date(dateStr),
    });

  it('should calculate total inflow, outflow, net savings, and savings rate', () => {
    const transactions = [
      createTx(5000, 'INCOME', '2026-09-01T00:00:00Z'), // Salary: $5000
      createTx(1500, 'EXPENSE', '2026-09-05T00:00:00Z'), // Rent: $1500
      createTx(500, 'EXPENSE', '2026-09-10T00:00:00Z'), // Food: $500
      createTx(1000, 'TRANSFER', '2026-09-15T00:00:00Z'), // DBS to IBKR transfer: ignored in cash flow
    ];

    const summary = CashFlowCalculator.calculateSummary(transactions);

    expect(summary.totalInflow).toBe(5000);
    expect(summary.totalOutflow).toBe(2000); // 1500 + 500
    expect(summary.netSavings).toBe(3000); // 5000 - 2000
    expect(summary.savingsRate).toBe(60); // (3000 / 5000) * 100 = 60%
  });

  it('should aggregate transactions by daily buckets', () => {
    const transactions = [
      createTx(100, 'EXPENSE', '2026-09-20T04:00:00Z'),
      createTx(50, 'EXPENSE', '2026-09-20T08:00:00Z'),
      createTx(200, 'EXPENSE', '2026-09-21T04:00:00Z'),
    ];

    const buckets = CashFlowCalculator.aggregateByPeriod(transactions, 'daily');

    expect(buckets).toHaveLength(2);
    expect(buckets[0].periodKey).toBe('2026-09-20');
    expect(buckets[0].outflow).toBe(150);
    expect(buckets[0].transactionCount).toBe(2);

    expect(buckets[1].periodKey).toBe('2026-09-21');
    expect(buckets[1].outflow).toBe(200);
    expect(buckets[1].transactionCount).toBe(1);
  });

  it('should aggregate transactions by monthly buckets', () => {
    const transactions = [
      createTx(4000, 'INCOME', '2026-08-01T00:00:00Z'),
      createTx(1000, 'EXPENSE', '2026-08-15T00:00:00Z'),
      createTx(5000, 'INCOME', '2026-09-01T00:00:00Z'),
      createTx(2000, 'EXPENSE', '2026-09-10T00:00:00Z'),
    ];

    const buckets = CashFlowCalculator.aggregateByPeriod(transactions, 'monthly');

    expect(buckets).toHaveLength(2);
    expect(buckets[0].periodKey).toBe('2026-08');
    expect(buckets[0].inflow).toBe(4000);
    expect(buckets[0].outflow).toBe(1000);
    expect(buckets[0].netSavings).toBe(3000);

    expect(buckets[1].periodKey).toBe('2026-09');
    expect(buckets[1].inflow).toBe(5000);
    expect(buckets[1].outflow).toBe(2000);
    expect(buckets[1].netSavings).toBe(3000);
  });
});
