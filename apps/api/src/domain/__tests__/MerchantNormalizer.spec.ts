import { describe, it, expect } from 'vitest';
import { MerchantNormalizer } from '../services/MerchantNormalizer';

describe('MerchantNormalizer Domain Service', () => {
  it('should normalize Grab variants', () => {
    expect(MerchantNormalizer.normalize('GRAB* A-892348 SINGAPORE SG')).toBe('Grab');
    expect(MerchantNormalizer.normalize('GRABFOOD SINGAPORE')).toBe('GrabFood');
  });

  it('should normalize Singapore supermarket names', () => {
    expect(MerchantNormalizer.normalize('FAIRPRICE FINEST BUKIT TIMAH')).toBe('FairPrice Finest');
    expect(MerchantNormalizer.normalize('NTUC FAIRPRICE - 1234')).toBe('FairPrice');
    expect(MerchantNormalizer.normalize('COLD STORAGE JELITA SINGAPORE')).toBe('Cold Storage');
    expect(MerchantNormalizer.normalize('DON DON DONKI ORCHARD')).toBe('Don Don Donki');
  });

  it('should normalize F&B and cafes', () => {
    expect(MerchantNormalizer.normalize("MCDONALD'S - BEDOK MALL")).toBe("McDonald's");
    expect(MerchantNormalizer.normalize('STARBUCKS COFFEE ION')).toBe('Starbucks');
    expect(MerchantNormalizer.normalize('KOI THE SINGAPORE')).toBe('KOI Thé');
    expect(MerchantNormalizer.normalize('YA KUN KAYA TOAST')).toBe('Ya Kun Kaya Toast');
  });

  it('should normalize PayNow recipient references', () => {
    expect(MerchantNormalizer.normalize('FAST / PAYNOW TO 91234567')).toBe('PayNow (91234567)');
    expect(MerchantNormalizer.normalize('PAYNOW TO UEN 201812345Z')).toBe('PayNow (201812345Z)');
  });

  it('should perform title casing on unknown uppercase merchants', () => {
    expect(MerchantNormalizer.normalize('RANDOM BOUTIQUE SHOP SINGAPORE SG')).toBe('Random Boutique Shop');
  });
});
