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

/**
 * The list of ISO currencies.
 */
export const isoCurrencies: CurrencyEntry[] = [
  { code: 'AED', numericCode: 784, name: 'UAE Dirham', defaultFractionDigits: 2 },
  { code: 'AFN', numericCode: 971, name: 'Afghani', defaultFractionDigits: 2 },
  { code: 'ALL', numericCode: 8, name: 'Lek', defaultFractionDigits: 2 },
  { code: 'AMD', numericCode: 51, name: 'Armenian Dram', defaultFractionDigits: 2 },
  { code: 'ANG', numericCode: 532, name: 'Netherlands Antillean Guilder', defaultFractionDigits: 2 },
  { code: 'AOA', numericCode: 973, name: 'Kwanza', defaultFractionDigits: 2 },
  { code: 'ARS', numericCode: 32, name: 'Argentine Peso', defaultFractionDigits: 2 },
  { code: 'AUD', numericCode: 36, name: 'Australian Dollar', defaultFractionDigits: 2 },
  { code: 'AWG', numericCode: 533, name: 'Aruban Florin', defaultFractionDigits: 2 },
  { code: 'AZN', numericCode: 944, name: 'Azerbaijan Manat', defaultFractionDigits: 2 },
  { code: 'BAM', numericCode: 977, name: 'Convertible Mark', defaultFractionDigits: 2 },
  { code: 'BBD', numericCode: 52, name: 'Barbados Dollar', defaultFractionDigits: 2 },
  { code: 'BDT', numericCode: 50, name: 'Taka', defaultFractionDigits: 2 },
  { code: 'BGN', numericCode: 975, name: 'Bulgarian Lev', defaultFractionDigits: 2 },
  { code: 'BHD', numericCode: 48, name: 'Bahraini Dinar', defaultFractionDigits: 3 },
  { code: 'BIF', numericCode: 108, name: 'Burundi Franc', defaultFractionDigits: 0 },
  { code: 'BMD', numericCode: 60, name: 'Bermudian Dollar', defaultFractionDigits: 2 },
  { code: 'BND', numericCode: 96, name: 'Brunei Dollar', defaultFractionDigits: 2 },
  { code: 'BOB', numericCode: 68, name: 'Boliviano', defaultFractionDigits: 2 },
  { code: 'BOV', numericCode: 984, name: 'Mvdol', defaultFractionDigits: 2 },
  { code: 'BRL', numericCode: 986, name: 'Brazilian Real', defaultFractionDigits: 2 },
  { code: 'BSD', numericCode: 44, name: 'Bahamian Dollar', defaultFractionDigits: 2 },
  { code: 'BTN', numericCode: 64, name: 'Ngultrum', defaultFractionDigits: 2 },
  { code: 'BWP', numericCode: 72, name: 'Pula', defaultFractionDigits: 2 },
  { code: 'BYN', numericCode: 933, name: 'Belarusian Ruble', defaultFractionDigits: 2 },
  { code: 'BZD', numericCode: 84, name: 'Belize Dollar', defaultFractionDigits: 2 },
  { code: 'CAD', numericCode: 124, name: 'Canadian Dollar', defaultFractionDigits: 2 },
  { code: 'CDF', numericCode: 976, name: 'Congolese Franc', defaultFractionDigits: 2 },
  { code: 'CHE', numericCode: 947, name: 'WIR Euro', defaultFractionDigits: 2 },
  { code: 'CHF', numericCode: 756, name: 'Swiss Franc', defaultFractionDigits: 2 },
  { code: 'CHW', numericCode: 948, name: 'WIR Franc', defaultFractionDigits: 2 },
  { code: 'CLF', numericCode: 990, name: 'Unidad de Fomento', defaultFractionDigits: 4 },
  { code: 'CLP', numericCode: 152, name: 'Chilean Peso', defaultFractionDigits: 0 },
  { code: 'CNY', numericCode: 156, name: 'Yuan Renminbi', defaultFractionDigits: 2 },
  { code: 'COP', numericCode: 170, name: 'Colombian Peso', defaultFractionDigits: 2 },
  { code: 'COU', numericCode: 970, name: 'Unidad de Valor Real', defaultFractionDigits: 2 },
  { code: 'CRC', numericCode: 188, name: 'Costa Rican Colon', defaultFractionDigits: 2 },
  { code: 'CUC', numericCode: 931, name: 'Peso Convertible', defaultFractionDigits: 2 },
  { code: 'CUP', numericCode: 192, name: 'Cuban Peso', defaultFractionDigits: 2 },
  { code: 'CVE', numericCode: 132, name: 'Cabo Verde Escudo', defaultFractionDigits: 2 },
  { code: 'CZK', numericCode: 203, name: 'Czech Koruna', defaultFractionDigits: 2 },
  { code: 'DJF', numericCode: 262, name: 'Djibouti Franc', defaultFractionDigits: 0 },
  { code: 'DKK', numericCode: 208, name: 'Danish Krone', defaultFractionDigits: 2 },
  { code: 'DOP', numericCode: 214, name: 'Dominican Peso', defaultFractionDigits: 2 },
  { code: 'DZD', numericCode: 12, name: 'Algerian Dinar', defaultFractionDigits: 2 },
  { code: 'EGP', numericCode: 818, name: 'Egyptian Pound', defaultFractionDigits: 2 },
  { code: 'ERN', numericCode: 232, name: 'Nakfa', defaultFractionDigits: 2 },
  { code: 'ETB', numericCode: 230, name: 'Ethiopian Birr', defaultFractionDigits: 2 },
  { code: 'EUR', numericCode: 978, name: 'Euro', defaultFractionDigits: 2 },
  { code: 'FJD', numericCode: 242, name: 'Fiji Dollar', defaultFractionDigits: 2 },
  { code: 'FKP', numericCode: 238, name: 'Falkland Islands Pound', defaultFractionDigits: 2 },
  { code: 'GBP', numericCode: 826, name: 'Pound Sterling', defaultFractionDigits: 2 },
  { code: 'GEL', numericCode: 981, name: 'Lari', defaultFractionDigits: 2 },
  { code: 'GHS', numericCode: 936, name: 'Ghana Cedi', defaultFractionDigits: 2 },
  { code: 'GIP', numericCode: 292, name: 'Gibraltar Pound', defaultFractionDigits: 2 },
  { code: 'GMD', numericCode: 270, name: 'Dalasi', defaultFractionDigits: 2 },
  { code: 'GNF', numericCode: 324, name: 'Guinean Franc', defaultFractionDigits: 0 },
  { code: 'GTQ', numericCode: 320, name: 'Quetzal', defaultFractionDigits: 2 },
  { code: 'GYD', numericCode: 328, name: 'Guyana Dollar', defaultFractionDigits: 2 },
  { code: 'HKD', numericCode: 344, name: 'Hong Kong Dollar', defaultFractionDigits: 2 },
  { code: 'HNL', numericCode: 340, name: 'Lempira', defaultFractionDigits: 2 },
  { code: 'HTG', numericCode: 332, name: 'Gourde', defaultFractionDigits: 2 },
  { code: 'HUF', numericCode: 348, name: 'Forint', defaultFractionDigits: 2 },
  { code: 'IDR', numericCode: 360, name: 'Rupiah', defaultFractionDigits: 2 },
  { code: 'ILS', numericCode: 376, name: 'New Israeli Sheqel', defaultFractionDigits: 2 },
  { code: 'INR', numericCode: 356, name: 'Indian Rupee', defaultFractionDigits: 2 },
  { code: 'IQD', numericCode: 368, name: 'Iraqi Dinar', defaultFractionDigits: 3 },
  { code: 'IRR', numericCode: 364, name: 'Iranian Rial', defaultFractionDigits: 2 },
  { code: 'ISK', numericCode: 352, name: 'Iceland Krona', defaultFractionDigits: 0 },
  { code: 'JMD', numericCode: 388, name: 'Jamaican Dollar', defaultFractionDigits: 2 },
  { code: 'JOD', numericCode: 400, name: 'Jordanian Dinar', defaultFractionDigits: 3 },
  { code: 'JPY', numericCode: 392, name: 'Yen', defaultFractionDigits: 0 },
  { code: 'KES', numericCode: 404, name: 'Kenyan Shilling', defaultFractionDigits: 2 },
  { code: 'KGS', numericCode: 417, name: 'Som', defaultFractionDigits: 2 },
  { code: 'KHR', numericCode: 116, name: 'Riel', defaultFractionDigits: 2 },
  { code: 'KMF', numericCode: 174, name: 'Comorian Franc', defaultFractionDigits: 0 },
  { code: 'KPW', numericCode: 408, name: 'North Korean Won', defaultFractionDigits: 2 },
  { code: 'KRW', numericCode: 410, name: 'Won', defaultFractionDigits: 0 },
  { code: 'KWD', numericCode: 414, name: 'Kuwaiti Dinar', defaultFractionDigits: 3 },
  { code: 'KYD', numericCode: 136, name: 'Cayman Islands Dollar', defaultFractionDigits: 2 },
  { code: 'KZT', numericCode: 398, name: 'Tenge', defaultFractionDigits: 2 },
  { code: 'LAK', numericCode: 418, name: 'Lao Kip', defaultFractionDigits: 2 },
  { code: 'LBP', numericCode: 422, name: 'Lebanese Pound', defaultFractionDigits: 2 },
  { code: 'LKR', numericCode: 144, name: 'Sri Lanka Rupee', defaultFractionDigits: 2 },
  { code: 'LRD', numericCode: 430, name: 'Liberian Dollar', defaultFractionDigits: 2 },
  { code: 'LSL', numericCode: 426, name: 'Loti', defaultFractionDigits: 2 },
  { code: 'LYD', numericCode: 434, name: 'Libyan Dinar', defaultFractionDigits: 3 },
  { code: 'MAD', numericCode: 504, name: 'Moroccan Dirham', defaultFractionDigits: 2 },
  { code: 'MDL', numericCode: 498, name: 'Moldovan Leu', defaultFractionDigits: 2 },
  { code: 'MGA', numericCode: 969, name: 'Malagasy Ariary', defaultFractionDigits: 2 },
  { code: 'MKD', numericCode: 807, name: 'Denar', defaultFractionDigits: 2 },
  { code: 'MMK', numericCode: 104, name: 'Kyat', defaultFractionDigits: 2 },
  { code: 'MNT', numericCode: 496, name: 'Tugrik', defaultFractionDigits: 2 },
  { code: 'MOP', numericCode: 446, name: 'Pataca', defaultFractionDigits: 2 },
  { code: 'MRU', numericCode: 929, name: 'Ouguiya', defaultFractionDigits: 2 },
  { code: 'MUR', numericCode: 480, name: 'Mauritius Rupee', defaultFractionDigits: 2 },
  { code: 'MVR', numericCode: 462, name: 'Rufiyaa', defaultFractionDigits: 2 },
  { code: 'MWK', numericCode: 454, name: 'Malawi Kwacha', defaultFractionDigits: 2 },
  { code: 'MXN', numericCode: 484, name: 'Mexican Peso', defaultFractionDigits: 2 },
  { code: 'MXV', numericCode: 979, name: 'Mexican Unidad de Inversion (UDI)', defaultFractionDigits: 2 },
  { code: 'MYR', numericCode: 458, name: 'Malaysian Ringgit', defaultFractionDigits: 2 },
  { code: 'MZN', numericCode: 943, name: 'Mozambique Metical', defaultFractionDigits: 2 },
  { code: 'NAD', numericCode: 516, name: 'Namibia Dollar', defaultFractionDigits: 2 },
  { code: 'NGN', numericCode: 566, name: 'Naira', defaultFractionDigits: 2 },
  { code: 'NIO', numericCode: 558, name: 'Cordoba Oro', defaultFractionDigits: 2 },
  { code: 'NOK', numericCode: 578, name: 'Norwegian Krone', defaultFractionDigits: 2 },
  { code: 'NPR', numericCode: 524, name: 'Nepalese Rupee', defaultFractionDigits: 2 },
  { code: 'NZD', numericCode: 554, name: 'New Zealand Dollar', defaultFractionDigits: 2 },
  { code: 'OMR', numericCode: 512, name: 'Rial Omani', defaultFractionDigits: 3 },
  { code: 'PAB', numericCode: 590, name: 'Balboa', defaultFractionDigits: 2 },
  { code: 'PEN', numericCode: 604, name: 'Sol', defaultFractionDigits: 2 },
  { code: 'PGK', numericCode: 598, name: 'Kina', defaultFractionDigits: 2 },
  { code: 'PHP', numericCode: 608, name: 'Philippine Peso', defaultFractionDigits: 2 },
  { code: 'PKR', numericCode: 586, name: 'Pakistan Rupee', defaultFractionDigits: 2 },
  { code: 'PLN', numericCode: 985, name: 'Zloty', defaultFractionDigits: 2 },
  { code: 'PYG', numericCode: 600, name: 'Guarani', defaultFractionDigits: 0 },
  { code: 'QAR', numericCode: 634, name: 'Qatari Rial', defaultFractionDigits: 2 },
  { code: 'RON', numericCode: 946, name: 'Romanian Leu', defaultFractionDigits: 2 },
  { code: 'RSD', numericCode: 941, name: 'Serbian Dinar', defaultFractionDigits: 2 },
  { code: 'RUB', numericCode: 643, name: 'Russian Ruble', defaultFractionDigits: 2 },
  { code: 'RWF', numericCode: 646, name: 'Rwanda Franc', defaultFractionDigits: 0 },
  { code: 'SAR', numericCode: 682, name: 'Saudi Riyal', defaultFractionDigits: 2 },
  { code: 'SBD', numericCode: 90, name: 'Solomon Islands Dollar', defaultFractionDigits: 2 },
  { code: 'SCR', numericCode: 690, name: 'Seychelles Rupee', defaultFractionDigits: 2 },
  { code: 'SDG', numericCode: 938, name: 'Sudanese Pound', defaultFractionDigits: 2 },
  { code: 'SEK', numericCode: 752, name: 'Swedish Krona', defaultFractionDigits: 2 },
  { code: 'SGD', numericCode: 702, name: 'Singapore Dollar', defaultFractionDigits: 2 },
  { code: 'SHP', numericCode: 654, name: 'Saint Helena Pound', defaultFractionDigits: 2 },
  { code: 'SLE', numericCode: 925, name: 'Leone', defaultFractionDigits: 2 },
  { code: 'SLL', numericCode: 694, name: 'Leone', defaultFractionDigits: 2 },
  { code: 'SOS', numericCode: 706, name: 'Somali Shilling', defaultFractionDigits: 2 },
  { code: 'SRD', numericCode: 968, name: 'Surinam Dollar', defaultFractionDigits: 2 },
  { code: 'SSP', numericCode: 728, name: 'South Sudanese Pound', defaultFractionDigits: 2 },
  { code: 'STN', numericCode: 930, name: 'Dobra', defaultFractionDigits: 2 },
  { code: 'SVC', numericCode: 222, name: 'El Salvador Colon', defaultFractionDigits: 2 },
  { code: 'SYP', numericCode: 760, name: 'Syrian Pound', defaultFractionDigits: 2 },
  { code: 'SZL', numericCode: 748, name: 'Lilangeni', defaultFractionDigits: 2 },
  { code: 'THB', numericCode: 764, name: 'Baht', defaultFractionDigits: 2 },
  { code: 'TJS', numericCode: 972, name: 'Somoni', defaultFractionDigits: 2 },
  { code: 'TMT', numericCode: 934, name: 'Turkmenistan New Manat', defaultFractionDigits: 2 },
  { code: 'TND', numericCode: 788, name: 'Tunisian Dinar', defaultFractionDigits: 3 },
  { code: 'TOP', numericCode: 776, name: 'Pa’anga', defaultFractionDigits: 2 },
  { code: 'TRY', numericCode: 949, name: 'Turkish Lira', defaultFractionDigits: 2 },
  { code: 'TTD', numericCode: 780, name: 'Trinidad and Tobago Dollar', defaultFractionDigits: 2 },
  { code: 'TWD', numericCode: 901, name: 'New Taiwan Dollar', defaultFractionDigits: 2 },
  { code: 'TZS', numericCode: 834, name: 'Tanzanian Shilling', defaultFractionDigits: 2 },
  { code: 'UAH', numericCode: 980, name: 'Hryvnia', defaultFractionDigits: 2 },
  { code: 'UGX', numericCode: 800, name: 'Uganda Shilling', defaultFractionDigits: 0 },
  { code: 'USD', numericCode: 840, name: 'US Dollar', defaultFractionDigits: 2 },
  { code: 'USN', numericCode: 997, name: 'US Dollar (Next day)', defaultFractionDigits: 2 },
  { code: 'UYI', numericCode: 940, name: 'Uruguay Peso en Unidades Indexadas (UI)', defaultFractionDigits: 0 },
  { code: 'UYU', numericCode: 858, name: 'Peso Uruguayo', defaultFractionDigits: 2 },
  { code: 'UYW', numericCode: 927, name: 'Unidad Previsional', defaultFractionDigits: 4 },
  { code: 'UZS', numericCode: 860, name: 'Uzbekistan Sum', defaultFractionDigits: 2 },
  { code: 'VED', numericCode: 926, name: 'Bolívar Soberano', defaultFractionDigits: 2 },
  { code: 'VES', numericCode: 928, name: 'Bolívar Soberano', defaultFractionDigits: 2 },
  { code: 'VND', numericCode: 704, name: 'Dong', defaultFractionDigits: 0 },
  { code: 'VUV', numericCode: 548, name: 'Vatu', defaultFractionDigits: 0 },
  { code: 'WST', numericCode: 882, name: 'Tala', defaultFractionDigits: 2 },
  { code: 'XAF', numericCode: 950, name: 'CFA Franc BEAC', defaultFractionDigits: 0 },
  { code: 'XCD', numericCode: 951, name: 'East Caribbean Dollar', defaultFractionDigits: 2 },
  { code: 'XOF', numericCode: 952, name: 'CFA Franc BCEAO', defaultFractionDigits: 0 },
  { code: 'XPF', numericCode: 953, name: 'CFP Franc', defaultFractionDigits: 0 },
  { code: 'YER', numericCode: 886, name: 'Yemeni Rial', defaultFractionDigits: 2 },
  { code: 'ZAR', numericCode: 710, name: 'Rand', defaultFractionDigits: 2 },
  { code: 'ZMW', numericCode: 967, name: 'Zambian Kwacha', defaultFractionDigits: 2 },
  { code: 'ZWL', numericCode: 932, name: 'Zimbabwe Dollar', defaultFractionDigits: 2 },
];

/**
 * Country to currency mappings
 */
export const countryToCurrency: { country: string; currencies: string[] }[] = [
  { country: 'AD', currencies: ['EUR'] },
  { country: 'AE', currencies: ['AED'] },
  { country: 'AF', currencies: ['AFN'] },
  { country: 'AG', currencies: ['XCD'] },
  { country: 'AI', currencies: ['XCD'] },
  { country: 'AL', currencies: ['ALL'] },
  { country: 'AM', currencies: ['AMD'] },
  { country: 'AO', currencies: ['AOA'] },
  { country: 'AR', currencies: ['ARS'] },
  { country: 'AS', currencies: ['USD'] },
  { country: 'AT', currencies: ['EUR'] },
  { country: 'AU', currencies: ['AUD'] },
  { country: 'AW', currencies: ['AWG'] },
  { country: 'AX', currencies: ['EUR'] },
  { country: 'AZ', currencies: ['AZN'] },
  { country: 'BA', currencies: ['BAM'] },
  { country: 'BB', currencies: ['BBD'] },
  { country: 'BD', currencies: ['BDT'] },
  { country: 'BE', currencies: ['EUR'] },
  { country: 'BF', currencies: ['XOF'] },
  { country: 'BG', currencies: ['BGN'] },
  { country: 'BH', currencies: ['BHD'] },
  { country: 'BI', currencies: ['BIF'] },
  { country: 'BJ', currencies: ['XOF'] },
  { country: 'BL', currencies: ['EUR'] },
  { country: 'BM', currencies: ['BMD'] },
  { country: 'BN', currencies: ['BND'] },
  { country: 'BO', currencies: ['BOB'] },
  { country: 'BQ', currencies: ['USD'] },
  { country: 'BR', currencies: ['BRL'] },
  { country: 'BS', currencies: ['BSD'] },
  { country: 'BT', currencies: ['INR', 'BTN'] },
  { country: 'BV', currencies: ['NOK'] },
  { country: 'BW', currencies: ['BWP'] },
  { country: 'BY', currencies: ['BYN'] },
  { country: 'BZ', currencies: ['BZD'] },
  { country: 'CA', currencies: ['CAD'] },
  { country: 'CC', currencies: ['AUD'] },
  { country: 'CD', currencies: ['CDF'] },
  { country: 'CF', currencies: ['XAF'] },
  { country: 'CG', currencies: ['XAF'] },
  { country: 'CH', currencies: ['CHF'] },
  { country: 'CI', currencies: ['XOF'] },
  { country: 'CK', currencies: ['NZD'] },
  { country: 'CL', currencies: ['CLP'] },
  { country: 'CM', currencies: ['XAF'] },
  { country: 'CN', currencies: ['CNY'] },
  { country: 'CO', currencies: ['COP'] },
  { country: 'CR', currencies: ['CRC'] },
  { country: 'CU', currencies: ['CUP', 'CUC'] },
  { country: 'CV', currencies: ['CVE'] },
  { country: 'CW', currencies: ['ANG'] },
  { country: 'CX', currencies: ['AUD'] },
  { country: 'CY', currencies: ['EUR'] },
  { country: 'CZ', currencies: ['CZK'] },
  { country: 'DE', currencies: ['EUR'] },
  { country: 'DJ', currencies: ['DJF'] },
  { country: 'DK', currencies: ['DKK'] },
  { country: 'DM', currencies: ['XCD'] },
  { country: 'DO', currencies: ['DOP'] },
  { country: 'DZ', currencies: ['DZD'] },
  { country: 'EC', currencies: ['USD'] },
  { country: 'EE', currencies: ['EUR'] },
  { country: 'EG', currencies: ['EGP'] },
  { country: 'EH', currencies: ['MAD'] },
  { country: 'ER', currencies: ['ERN'] },
  { country: 'ES', currencies: ['EUR'] },
  { country: 'ET', currencies: ['ETB'] },
  { country: 'FI', currencies: ['EUR'] },
  { country: 'FJ', currencies: ['FJD'] },
  { country: 'FK', currencies: ['FKP'] },
  { country: 'FM', currencies: ['USD'] },
  { country: 'FO', currencies: ['DKK'] },
  { country: 'FR', currencies: ['EUR'] },
  { country: 'GA', currencies: ['XAF'] },
  { country: 'GB', currencies: ['GBP'] },
  { country: 'GD', currencies: ['XCD'] },
  { country: 'GE', currencies: ['GEL'] },
  { country: 'GF', currencies: ['EUR'] },
  { country: 'GG', currencies: ['GBP'] },
  { country: 'GH', currencies: ['GHS'] },
  { country: 'GI', currencies: ['GIP'] },
  { country: 'GL', currencies: ['DKK'] },
  { country: 'GM', currencies: ['GMD'] },
  { country: 'GN', currencies: ['GNF'] },
  { country: 'GP', currencies: ['EUR'] },
  { country: 'GQ', currencies: ['XAF'] },
  { country: 'GR', currencies: ['EUR'] },
  { country: 'GT', currencies: ['GTQ'] },
  { country: 'GU', currencies: ['USD'] },
  { country: 'GW', currencies: ['XOF'] },
  { country: 'GY', currencies: ['GYD'] },
  { country: 'HK', currencies: ['HKD'] },
  { country: 'HM', currencies: ['AUD'] },
  { country: 'HN', currencies: ['HNL'] },
  { country: 'HR', currencies: ['EUR'] },
  { country: 'HT', currencies: ['HTG', 'USD'] },
  { country: 'HU', currencies: ['HUF'] },
  { country: 'ID', currencies: ['IDR'] },
  { country: 'IE', currencies: ['EUR'] },
  { country: 'IL', currencies: ['ILS'] },
  { country: 'IM', currencies: ['GBP'] },
  { country: 'IN', currencies: ['INR'] },
  { country: 'IO', currencies: ['USD'] },
  { country: 'IQ', currencies: ['IQD'] },
  { country: 'IR', currencies: ['IRR'] },
  { country: 'IS', currencies: ['ISK'] },
  { country: 'IT', currencies: ['EUR'] },
  { country: 'JE', currencies: ['GBP'] },
  { country: 'JM', currencies: ['JMD'] },
  { country: 'JO', currencies: ['JOD'] },
  { country: 'JP', currencies: ['JPY'] },
  { country: 'KE', currencies: ['KES'] },
  { country: 'KG', currencies: ['KGS'] },
  { country: 'KH', currencies: ['KHR'] },
  { country: 'KI', currencies: ['AUD'] },
  { country: 'KM', currencies: ['KMF'] },
  { country: 'KN', currencies: ['XCD'] },
  { country: 'KP', currencies: ['KPW'] },
  { country: 'KR', currencies: ['KRW'] },
  { country: 'KW', currencies: ['KWD'] },
  { country: 'KY', currencies: ['KYD'] },
  { country: 'KZ', currencies: ['KZT'] },
  { country: 'LA', currencies: ['LAK'] },
  { country: 'LB', currencies: ['LBP'] },
  { country: 'LC', currencies: ['XCD'] },
  { country: 'LI', currencies: ['CHF'] },
  { country: 'LK', currencies: ['LKR'] },
  { country: 'LR', currencies: ['LRD'] },
  { country: 'LS', currencies: ['LSL', 'ZAR'] },
  { country: 'LT', currencies: ['EUR'] },
  { country: 'LU', currencies: ['EUR'] },
  { country: 'LV', currencies: ['EUR'] },
  { country: 'LY', currencies: ['LYD'] },
  { country: 'MA', currencies: ['MAD'] },
  { country: 'MC', currencies: ['EUR'] },
  { country: 'MD', currencies: ['MDL'] },
  { country: 'ME', currencies: ['EUR'] },
  { country: 'MF', currencies: ['EUR'] },
  { country: 'MG', currencies: ['MGA'] },
  { country: 'MH', currencies: ['USD'] },
  { country: 'MK', currencies: ['MKD'] },
  { country: 'ML', currencies: ['XOF'] },
  { country: 'MM', currencies: ['MMK'] },
  { country: 'MN', currencies: ['MNT'] },
  { country: 'MO', currencies: ['MOP'] },
  { country: 'MP', currencies: ['USD'] },
  { country: 'MQ', currencies: ['EUR'] },
  { country: 'MR', currencies: ['MRU'] },
  { country: 'MS', currencies: ['XCD'] },
  { country: 'MT', currencies: ['EUR'] },
  { country: 'MU', currencies: ['MUR'] },
  { country: 'MV', currencies: ['MVR'] },
  { country: 'MW', currencies: ['MWK'] },
  { country: 'MX', currencies: ['MXN'] },
  { country: 'MY', currencies: ['MYR'] },
  { country: 'MZ', currencies: ['MZN'] },
  { country: 'NA', currencies: ['NAD', 'ZAR'] },
  { country: 'NC', currencies: ['XPF'] },
  { country: 'NE', currencies: ['XOF'] },
  { country: 'NF', currencies: ['AUD'] },
  { country: 'NG', currencies: ['NGN'] },
  { country: 'NI', currencies: ['NIO'] },
  { country: 'NL', currencies: ['EUR'] },
  { country: 'NO', currencies: ['NOK'] },
  { country: 'NP', currencies: ['NPR'] },
  { country: 'NR', currencies: ['AUD'] },
  { country: 'NU', currencies: ['NZD'] },
  { country: 'NZ', currencies: ['NZD'] },
  { country: 'OM', currencies: ['OMR'] },
  { country: 'PA', currencies: ['PAB', 'USD'] },
  { country: 'PE', currencies: ['PEN'] },
  { country: 'PF', currencies: ['XPF'] },
  { country: 'PG', currencies: ['PGK'] },
  { country: 'PH', currencies: ['PHP'] },
  { country: 'PK', currencies: ['PKR'] },
  { country: 'PL', currencies: ['PLN'] },
  { country: 'PM', currencies: ['EUR'] },
  { country: 'PN', currencies: ['NZD'] },
  { country: 'PR', currencies: ['USD'] },
  { country: 'PT', currencies: ['EUR'] },
  { country: 'PW', currencies: ['USD'] },
  { country: 'PY', currencies: ['PYG'] },
  { country: 'QA', currencies: ['QAR'] },
  { country: 'RE', currencies: ['EUR'] },
  { country: 'RO', currencies: ['RON'] },
  { country: 'RS', currencies: ['RSD'] },
  { country: 'RU', currencies: ['RUB'] },
  { country: 'RW', currencies: ['RWF'] },
  { country: 'SA', currencies: ['SAR'] },
  { country: 'SB', currencies: ['SBD'] },
  { country: 'SC', currencies: ['SCR'] },
  { country: 'SD', currencies: ['SDG'] },
  { country: 'SE', currencies: ['SEK'] },
  { country: 'SG', currencies: ['SGD'] },
  { country: 'SH', currencies: ['SHP'] },
  { country: 'SI', currencies: ['EUR'] },
  { country: 'SJ', currencies: ['NOK'] },
  { country: 'SK', currencies: ['EUR'] },
  { country: 'SL', currencies: ['SLL', 'SLE'] },
  { country: 'SM', currencies: ['EUR'] },
  { country: 'SN', currencies: ['XOF'] },
  { country: 'SO', currencies: ['SOS'] },
  { country: 'SR', currencies: ['SRD'] },
  { country: 'SS', currencies: ['SSP'] },
  { country: 'ST', currencies: ['STN'] },
  { country: 'SV', currencies: ['SVC', 'USD'] },
  { country: 'SX', currencies: ['ANG'] },
  { country: 'SY', currencies: ['SYP'] },
  { country: 'SZ', currencies: ['SZL'] },
  { country: 'TC', currencies: ['USD'] },
  { country: 'TD', currencies: ['XAF'] },
  { country: 'TF', currencies: ['EUR'] },
  { country: 'TG', currencies: ['XOF'] },
  { country: 'TH', currencies: ['THB'] },
  { country: 'TJ', currencies: ['TJS'] },
  { country: 'TK', currencies: ['NZD'] },
  { country: 'TL', currencies: ['USD'] },
  { country: 'TM', currencies: ['TMT'] },
  { country: 'TN', currencies: ['TND'] },
  { country: 'TO', currencies: ['TOP'] },
  { country: 'TR', currencies: ['TRY'] },
  { country: 'TT', currencies: ['TTD'] },
  { country: 'TV', currencies: ['AUD'] },
  { country: 'TW', currencies: ['TWD'] },
  { country: 'TZ', currencies: ['TZS'] },
  { country: 'UA', currencies: ['UAH'] },
  { country: 'UG', currencies: ['UGX'] },
  { country: 'UM', currencies: ['USD'] },
  { country: 'US', currencies: ['USD'] },
  { country: 'UY', currencies: ['UYU', 'UYW'] },
  { country: 'UZ', currencies: ['UZS'] },
  { country: 'VA', currencies: ['EUR'] },
  { country: 'VC', currencies: ['XCD'] },
  { country: 'VE', currencies: ['VES', 'VED'] },
  { country: 'VG', currencies: ['USD'] },
  { country: 'VI', currencies: ['USD'] },
  { country: 'VN', currencies: ['VND'] },
  { country: 'VU', currencies: ['VUV'] },
  { country: 'WF', currencies: ['XPF'] },
  { country: 'WS', currencies: ['WST'] },
  { country: 'YE', currencies: ['YER'] },
  { country: 'YT', currencies: ['EUR'] },
  { country: 'ZA', currencies: ['ZAR'] },
  { country: 'ZM', currencies: ['ZMW'] },
  { country: 'ZW', currencies: ['ZWL'] },
];

/**
 * Loads the ISO currencies and country to currency mappings.
 */
Currency.loadIsoCurrencies(isoCurrencies);
Currency.loadCountryCurrencies(countryToCurrency);
