export type CurrencyEntry = {
  code: string;
  numericCode: number;
  name: string;
  defaultFractionDigits: number;
};

export type CountryCurrencyMapping = {
  country: string;
  currencies: string[];
};

export class Currency {
  private static currencies: Map<string, Currency> = new Map();
  private static countryToCurrencies: Map<string, string[]> = new Map();

  private constructor(
    private readonly currencyCode: string,
    private readonly numericCode: number,
    private readonly name: string,
    private readonly defaultFractionDigits: number
  ) {
    if (defaultFractionDigits < 0) {
      throw new Error('The default fraction digits cannot be less than zero.');
    }
  }

  static loadIsoCurrencies(data: CurrencyEntry[]): void {
    for (const entry of data) {
      this.currencies.set(
        entry.code,
        new Currency(entry.code, entry.numericCode, entry.name, entry.defaultFractionDigits)
      );
    }
  }

  static loadCountryCurrencies(data: CountryCurrencyMapping[]): void {
    for (const entry of data) {
      this.countryToCurrencies.set(entry.country.toUpperCase(), entry.currencies);
    }
  }

  static of(currencyCode: string | number): Currency {
    if (typeof currencyCode === 'number') {
      for (const currency of this.currencies.values()) {
        if (currency.numericCode === currencyCode) {
          return currency;
        }
      }
    } else {
      const currency = this.currencies.get(currencyCode.toUpperCase());
      if (currency) {
        return currency;
      }
    }
    throw new Error(`Unknown currency: ${currencyCode}`);
  }

  static getCurrenciesByCountry(countryCode: string): Currency[] {
    const currencyCodes = this.countryToCurrencies.get(countryCode.toUpperCase());
    if (!currencyCodes) {
      throw new Error(`Unknown country code: ${countryCode}`);
    }
    return currencyCodes.map(code => this.of(code));
  }

  getCurrencyCode(): string {
    return this.currencyCode;
  }

  getNumericCode(): number {
    return this.numericCode;
  }

  getName(): string {
    return this.name;
  }

  getDefaultFractionDigits(): number {
    return this.defaultFractionDigits;
  }

  is(currency: Currency | string | number): boolean {
    if (currency instanceof Currency) {
      return this.currencyCode === currency.currencyCode;
    }
    return (
      this.currencyCode === String(currency) ||
      (this.numericCode !== 0 && this.numericCode === Number(currency))
    );
  }

  toJSON(): string {
    return this.currencyCode;
  }

  toString(): string {
    return this.currencyCode;
  }
}
