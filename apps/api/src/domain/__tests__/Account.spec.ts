import { describe, it, expect } from 'vitest';
import { Account } from '../entities/Account';

describe('Account Entity', () => {
  it('should create an account with default values', () => {
    const account = Account.create({
      name: 'DBS Multi-Currency',
      institution: 'DBS',
      type: 'SAVINGS',
      accountNumberMask: '5678',
    });

    expect(account.id).toBeDefined();
    expect(account.name).toBe('DBS Multi-Currency');
    expect(account.institution).toBe('DBS');
    expect(account.type).toBe('SAVINGS');
    expect(account.currency).toBe('SGD');
    expect(account.currentBalance).toBe(0);
    expect(account.isActive).toBe(true);
  });

  it('should correctly match mask from bank alerts', () => {
    const cardAccount = Account.create({
      name: 'DBS Altitude Card',
      institution: 'DBS',
      type: 'CREDIT_CARD',
      accountNumberMask: '1234',
    });

    expect(cardAccount.matchesMask('1234')).toBe(true);
    expect(cardAccount.matchesMask('...1234')).toBe(true);
    expect(cardAccount.matchesMask('**** 1234')).toBe(true);
    expect(cardAccount.matchesMask('9999')).toBe(false);
  });

  it('should adjust balance cleanly', () => {
    const account = Account.create({
      name: 'Standard Chartered',
      institution: 'SCB',
      type: 'SAVINGS',
      currentBalance: 500,
    });

    account.adjustBalance(250);
    expect(account.currentBalance).toBe(750);

    account.adjustBalance(-100);
    expect(account.currentBalance).toBe(650);
  });
});
