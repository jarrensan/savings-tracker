import { format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { Transaction } from '../entities/Transaction';
import { Granularity } from '../types/common';
import currency from 'currency.js';

export interface CashFlowSummary {
  totalInflow: number;
  totalOutflow: number;
  netSavings: number;
  savingsRate: number; // Percentage, e.g. 35.5 (%)
  currency: string;
}

export interface PeriodBucket {
  periodKey: string; // e.g. "2026-09-26" or "2026-W39" or "2026-09"
  label: string;
  inflow: number;
  outflow: number;
  netSavings: number;
  transactionCount: number;
}

export interface CategorySpendSummary {
  categoryId: string | null;
  categoryName: string;
  totalSpent: number;
  percentageOfTotal: number;
}

export class CashFlowCalculator {
  static calculateSummary(
    transactions: Transaction[],
    baseCurrency: string = 'SGD',
  ): CashFlowSummary {
    let inflow = currency(0);
    let outflow = currency(0);

    for (const tx of transactions) {
      if (tx.isTransfer()) {
        // Transfers between own accounts do not impact net cash flow
        continue;
      }

      if (tx.isIncome()) {
        inflow = inflow.add(Math.abs(tx.amount));
      } else if (tx.isExpense()) {
        outflow = outflow.add(Math.abs(tx.amount));
      }
    }

    const netSavings = inflow.subtract(outflow).value;
    const totalInflowVal = inflow.value;
    const totalOutflowVal = outflow.value;

    let savingsRate = 0;
    if (totalInflowVal > 0) {
      savingsRate = Math.round(((totalInflowVal - totalOutflowVal) / totalInflowVal) * 10000) / 100;
    }

    return {
      totalInflow: totalInflowVal,
      totalOutflow: totalOutflowVal,
      netSavings,
      savingsRate,
      currency: baseCurrency,
    };
  }

  static aggregateByPeriod(
    transactions: Transaction[],
    granularity: Granularity,
  ): PeriodBucket[] {
    const bucketsMap = new Map<string, {
      label: string;
      inflow: currency;
      outflow: currency;
      count: number;
    }>();

    for (const tx of transactions) {
      if (tx.isTransfer()) continue;

      const date = tx.transactionDate;
      let periodKey: string;
      let label: string;

      switch (granularity) {
        case 'daily': {
          const start = startOfDay(date);
          periodKey = format(start, 'yyyy-MM-dd');
          label = format(start, 'MMM dd');
          break;
        }
        case 'weekly': {
          const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
          periodKey = format(start, 'yyyy-\'W\'II');
          label = `Wk of ${format(start, 'MMM dd')}`;
          break;
        }
        case 'monthly': {
          const start = startOfMonth(date);
          periodKey = format(start, 'yyyy-MM');
          label = format(start, 'MMM yyyy');
          break;
        }
      }

      if (!bucketsMap.has(periodKey)) {
        bucketsMap.set(periodKey, {
          label,
          inflow: currency(0),
          outflow: currency(0),
          count: 0,
        });
      }

      const bucket = bucketsMap.get(periodKey)!;
      bucket.count += 1;

      if (tx.isIncome()) {
        bucket.inflow = bucket.inflow.add(Math.abs(tx.amount));
      } else if (tx.isExpense()) {
        bucket.outflow = bucket.outflow.add(Math.abs(tx.amount));
      }
    }

    // Sort buckets chronologically
    return Array.from(bucketsMap.entries())
      .sort(([aKey], [bKey]) => aKey.localeCompare(bKey))
      .map(([periodKey, b]) => ({
        periodKey,
        label: b.label,
        inflow: b.inflow.value,
        outflow: b.outflow.value,
        netSavings: b.inflow.subtract(b.outflow).value,
        transactionCount: b.count,
      }));
  }

  static aggregateByCategory(
    transactions: Transaction[],
    categoryNames: Map<string, string>,
  ): CategorySpendSummary[] {
    const spendMap = new Map<string | null, currency>();
    let grandTotalOutflow = currency(0);

    for (const tx of transactions) {
      if (!tx.isExpense()) continue;

      const cost = Math.abs(tx.amount);
      grandTotalOutflow = grandTotalOutflow.add(cost);

      const catId = tx.categoryId;
      const current = spendMap.get(catId) ?? currency(0);
      spendMap.set(catId, current.add(cost));
    }

    const totalVal = grandTotalOutflow.value;

    return Array.from(spendMap.entries())
      .map(([catId, spent]) => {
        const spentVal = spent.value;
        const percentage = totalVal > 0
          ? Math.round((spentVal / totalVal) * 10000) / 100
          : 0;
        return {
          categoryId: catId,
          categoryName: catId ? (categoryNames.get(catId) ?? 'Unknown Category') : 'Uncategorized',
          totalSpent: spentVal,
          percentageOfTotal: percentage,
        };
      })
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }
}
