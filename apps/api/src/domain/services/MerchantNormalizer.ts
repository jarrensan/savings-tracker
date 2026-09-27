export class MerchantNormalizer {
  private static readonly KNOWN_MERCHANT_PATTERNS: Array<{
    regex: RegExp;
    cleanName: string;
  }> = [
    { regex: /^GRABFOOD/i, cleanName: 'GrabFood' },
    { regex: /^GRAB\*/i, cleanName: 'Grab' },
    { regex: /^FOODPANDA/i, cleanName: 'Foodpanda' },
    { regex: /^DELIVEROO/i, cleanName: 'Deliveroo' },
    { regex: /FAIRPRICE\s*FINEST/i, cleanName: 'FairPrice Finest' },
    { regex: /FAIRPRICE\s*XTRA/i, cleanName: 'FairPrice Xtra' },
    { regex: /NTUC\s*FAIRPRICE|FAIRPRICE/i, cleanName: 'FairPrice' },
    { regex: /COLD\s*STORAGE/i, cleanName: 'Cold Storage' },
    { regex: /SHENG\s*SIONG/i, cleanName: 'Sheng Siong' },
    { regex: /DON\s*DON\s*DONKI|DONKI/i, cleanName: 'Don Don Donki' },
    { regex: /MCDONALD/i, cleanName: "McDonald's" },
    { regex: /STARBUCKS/i, cleanName: 'Starbucks' },
    { regex: /KOI\s*THE|KOI\s*CAF[EÉ]/i, cleanName: 'KOI Thé' },
    { regex: /GONG\s*CHA/i, cleanName: 'Gong Cha' },
    { regex: /KOPITIAM/i, cleanName: 'Kopitiam' },
    { regex: /YA\s*KUN/i, cleanName: 'Ya Kun Kaya Toast' },
    { regex: /TOAST\s*BOX/i, cleanName: 'Toast Box' },
    { regex: /SHOPEE/i, cleanName: 'Shopee' },
    { regex: /LAZADA/i, cleanName: 'Lazada' },
    { regex: /AMAZON/i, cleanName: 'Amazon' },
    { regex: /NETFLIX/i, cleanName: 'Netflix' },
    { regex: /SPOTIFY/i, cleanName: 'Spotify' },
    { regex: /SP\s*SERVICES|SP\s*GROUP/i, cleanName: 'SP Services (Utilities)' },
    { regex: /SINGTEL/i, cleanName: 'Singtel' },
    { regex: /STARHUB/i, cleanName: 'StarHub' },
    { regex: /M1\s*LIMITED|M1\s*NET/i, cleanName: 'M1' },
    { regex: /COMFORTDELGRO|CITYCAB/i, cleanName: 'ComfortDelGro' },
  ];

  static normalize(raw: string): string {
    if (!raw) return 'Unknown Merchant';

    const trimmed = raw.trim();

    // Check for PayNow patterns
    const paynowPhoneMatch = trimmed.match(/(?:PAYNOW\s*TO|PAYNOW\s*FROM)\s*(\+?65\d{8}|\d{8})/i);
    if (paynowPhoneMatch) {
      return `PayNow (${paynowPhoneMatch[1]})`;
    }

    const paynowUenMatch = trimmed.match(/(?:PAYNOW\s*TO|PAYNOW\s*FROM)\s*(?:UEN\s*)?([A-Z0-9]{9,10}[A-Z])/i);
    if (paynowUenMatch) {
      return `PayNow (${paynowUenMatch[1]})`;
    }

    // Check against known Singapore merchant patterns
    for (const { regex, cleanName } of this.KNOWN_MERCHANT_PATTERNS) {
      if (regex.test(trimmed)) {
        return cleanName;
      }
    }

    // Generic cleanup: strip gateway asterisks, numbers, terminal noise, and country suffixes
    let cleaned = trimmed
      .replace(/^[A-Z0-9_-]+\*/i, '') // e.g. "PAYPAL *XYZ" -> "XYZ"
      .replace(/\s*(?:SINGAPORE\s*SG|SINGAPORE|SG)$/i, '') // strip trailing Singapore
      .replace(/\s*-\s*\d+$/, '') // strip trailing terminal id "- 1234"
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleaned) return trimmed;

    // Convert ALL CAPS to Title Case for better readability
    if (cleaned === cleaned.toUpperCase() && cleaned.length > 3) {
      cleaned = cleaned
        .toLowerCase()
        .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
    }

    return cleaned;
  }
}
