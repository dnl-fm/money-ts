/**
 * Represents an entry for a currency in the ISO currency list.
 */
export type CurrencyEntry = {
  /** The ISO 4217 currency code */
  code: string;
  /** The ISO 4217 numeric currency code */
  numericCode: number;
  /** The name of the currency */
  name: string;
  /** The number of digits after the decimal point for the currency */
  defaultFractionDigits: number;
};

/**
 * Represents a mapping between a country and its currencies.
 */
export type CountryCurrencyMapping = {
  /** The country code */
  country: string;
  /** An array of currency codes used in the country */
  currencies: string[];
};

/**
 * Represents a currency and provides methods for currency-related operations.
 */
export class Currency {
  private static currencies: Map<string, Currency> = new Map();
  private static countryToCurrencies: Map<string, string[]> = new Map();

  /**
   * Creates a new Currency instance.
   * @param {string} currencyCode - The ISO 4217 currency code.
   * @param {number} numericCode - The ISO 4217 numeric currency code.
   * @param {string} name - The name of the currency.
   * @param {number} defaultFractionDigits - The number of digits after the decimal point for the currency.
   * @throws {Error} If the default fraction digits are less than zero.
   * @private
   */
  private constructor(
    private readonly currencyCode: string,
    private readonly numericCode: number,
    private readonly name: string,
    private readonly defaultFractionDigits: number,
  ) {
    if (defaultFractionDigits < 0) {
      throw new Error('The default fraction digits cannot be less than zero.');
    }
  }

  /**
   * Loads ISO currencies into the Currency class.
   * @param {CurrencyEntry[]} data - An array of currency entries to load.
   */
  static loadIsoCurrencies(data: CurrencyEntry[]): void {
    for (const entry of data) {
      this.currencies.set(
        entry.code,
        new Currency(entry.code, entry.numericCode, entry.name, entry.defaultFractionDigits),
      );
    }
  }

  /**
   * Loads country-to-currencies mappings into the Currency class.
   * @param {CountryCurrencyMapping[]} data - An array of country-to-currencies mappings to load.
   */
  static loadCountryCurrencies(data: CountryCurrencyMapping[]): void {
    for (const entry of data) {
      this.countryToCurrencies.set(entry.country.toUpperCase(), entry.currencies);
    }
  }

  /**
   * Gets a Currency instance by its code or numeric code.
   * @param {string | number} currencyCode - The currency code or numeric code.
   * @returns {Currency} The Currency instance.
   * @throws {Error} If the currency is not found.
   */
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

  /**
   * Gets an array of Currency instances used in a specific country.
   * @param {string} countryCode - The country code.
   * @returns {Currency[]} An array of Currency instances used in the country.
   * @throws {Error} If the country code is not found.
   */
  static getCurrenciesByCountry(countryCode: string): Currency[] {
    const currencyCodes = this.countryToCurrencies.get(countryCode.toUpperCase());
    if (!currencyCodes) {
      throw new Error(`Unknown country code: ${countryCode}`);
    }
    return currencyCodes.map((code) => this.of(code));
  }

  /**
   * Gets the currency code.
   * @returns {string} The currency code.
   */
  getCurrencyCode(): string {
    return this.currencyCode;
  }

  /**
   * Gets the numeric currency code.
   * @returns {number} The numeric currency code.
   */
  getNumericCode(): number {
    return this.numericCode;
  }

  /**
   * Gets the name of the currency.
   * @returns {string} The name of the currency.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Gets the number of digits after the decimal point for the currency.
   * @returns {number} The number of digits after the decimal point.
   */
  getDefaultFractionDigits(): number {
    return this.defaultFractionDigits;
  }

  /**
   * Checks if this Currency instance is equal to another Currency or matches a given code or numeric code.
   * @param {Currency | string | number} currency - The Currency instance, currency code, or numeric code to compare.
   * @returns {boolean} True if the currencies are equal, false otherwise.
   */
  is(currency: Currency | string | number): boolean {
    if (currency instanceof Currency) {
      return this.currencyCode === currency.currencyCode;
    }
    return (
      this.currencyCode === String(currency) ||
      (this.numericCode !== 0 && this.numericCode === Number(currency))
    );
  }

  /**
   * Returns a JSON representation of the Currency instance.
   * @returns {string} The currency code.
   */
  toJSON(): string {
    return this.currencyCode;
  }

  /**
   * Returns a string representation of the Currency instance.
   * @returns {string} The currency code.
   */
  toString(): string {
    return this.currencyCode;
  }
}
