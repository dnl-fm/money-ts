import { Currency } from './currency.ts';

/**
 * Represents a monetary amount in a specific currency.
 */
export class Money {
  private amount: bigint;
  private readonly currency: Currency;

  /**
   * Creates a new Money instance.
   * @param {number | string | bigint} amount - The monetary amount.
   * @param {Currency} currency - The currency of the monetary amount.
   */
  constructor(amount: number | string | bigint, currency: Currency) {
    this.amount = typeof amount === 'bigint' ? amount : BigInt(Math.round(Number(amount) * Math.pow(10, currency.getDefaultFractionDigits())));
    this.currency = currency;
  }

  /**
   * Creates a new Money instance from a decimal amount.
   * @param {number | string} amount - The decimal amount.
   * @param {Currency} currency - The currency of the monetary amount.
   * @returns {Money} A new Money instance.
   */
  static of(amount: number | string, currency: Currency): Money {
    return new Money(amount, currency);
  }

  /**
   * Creates a new Money instance from a minor currency unit amount.
   * @param {bigint} minorAmount - The amount in minor currency units.
   * @param {Currency} currency - The currency of the monetary amount.
   * @returns {Money} A new Money instance.
   */
  static ofMinor(minorAmount: bigint, currency: Currency): Money {
    return new Money(minorAmount, currency);
  }

  /**
   * Creates a new Money instance with zero amount.
   * @param {Currency | string | number} currency - The currency or its code/numeric code.
   * @returns {Money} A new Money instance with zero amount.
   */
  static zero(currency: Currency | string | number): Money {
    let currencyInstance: Currency;

    if (typeof currency === 'string' || typeof currency === 'number') {
      currencyInstance = Currency.of(currency);
    } else {
      currencyInstance = currency;
    }

    return new Money(0, currencyInstance);
  }

  /**
   * Serializes an object which might include Money instances.
   * @param {unknown} obj - The object to serialize.
   * @returns {string} The serialized JSON string.
   */
  static serializeObject(obj: unknown): string {
    return JSON.stringify(obj, (_, value) => {
      if (value instanceof Money) {
        return { amount: value.amount.toString(), currency: value.currency, __money: true };
      }
      return value;
    });
  }

  /**
   * Deserializes a JSON string which might include a Money instances.
   * @param {string} json - The JSON string to deserialize.
   * @returns {unknown} The deserialized object.
   */
  static deserializeObject<T>(json: string): T {
    return JSON.parse(json, (_, value) => {
      if (value && typeof value === 'object' && value.__money === true) {
        return Money.ofMinor(BigInt(value.amount), Currency.of(value.currency));
      }
      return value;
    });
  }

  /**
   * Returns a string representation of the monetary amount.
   * @returns {string} A string representation of the monetary amount.
   */
  toString(): string {
    return `${this.currency.getCurrencyCode()} ${this.getAmount()}`;
  }

  /**
   * Adds another Money instance to this one.
   * @param {Money} other - The Money instance to add.
   * @returns {Money} A new Money instance with the sum.
   * @throws {Error} If the currencies are different.
   */
  plus(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtracts another Money instance from this one.
   * @param {Money} other - The Money instance to subtract.
   * @returns {Money} A new Money instance with the difference.
   * @throws {Error} If the currencies are different.
   */
  minus(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * Multiplies the monetary amount by a factor.
   * @param {number | string} factor - The factor to multiply by.
   * @returns {Money} A new Money instance with the product.
   */
  multipliedBy(factor: number | string): Money {
    const scale = this.currency.getDefaultFractionDigits();
    const factorBigInt = this.toBigIntWithScale(factor, scale);
    return new Money(this.amount * factorBigInt / BigInt(Math.pow(10, scale)), this.currency);
  }

  /**
   * Calculates a percentage of the monetary amount.
   * @param {number | string} percentage - The percentage value
   * @param {PercentageFormat} [format=PercentageFormat.AS_DECIMAL] - The format of the input value
   * @returns {Money} A new Money instance with the calculated percentage amount
   */
  percentage(percentage: number, format: PercentageFormat = PercentageFormat.AS_DECIMAL): Money {
    if (format === PercentageFormat.AS_PERCENTAGE) {
      percentage = percentage / 100;
    }
    return this.multipliedBy(percentage);
  }

  /**
   * Divides the monetary amount by a divisor.
   * @param {number | string} divisor - The divisor to divide by.
   * @param {RoundingMode} [roundingMode=RoundingMode.HALF_UP] - The rounding mode to use.
   * @returns {Money} A new Money instance with the quotient.
   */
  dividedBy(divisor: number | string, roundingMode: RoundingMode = RoundingMode.HALF_UP): Money {
    const scale = this.currency.getDefaultFractionDigits();
    const divisorBigInt = this.toBigIntWithScale(divisor, scale);

    // Perform the division with proper scaling
    const result = this.roundDiv(this.amount * BigInt(Math.pow(10, scale)), divisorBigInt, roundingMode);
    return new Money(result, this.currency);
  }

  /**
   * Splits the monetary amount into equal parts.
   * @param {number} parts - The number of parts to split into.
   * @returns {Money[]} An array of Money instances representing the split parts.
   */
  split(parts: number): Money[] {
    const equalParts = Array(parts).fill(1);
    return this.allocate(...equalParts);
  }

  /**
   * Allocates the monetary amount according to the given ratios.
   * @param {...number} ratios - The ratios to allocate by.
   * @returns {Money[]} An array of Money instances representing the allocated parts.
   * @throws {Error} If the ratios are invalid.
   */
  allocate(...ratios: number[]): Money[] {
    if (ratios.length === 0) {
      throw new Error('Cannot allocate with an empty list of ratios.');
    }

    if (ratios.some((ratio) => ratio < 0)) {
      throw new Error('Cannot allocate with negative ratios.');
    }

    if (ratios.some((ratio) => ratio === 0)) {
      throw new Error('Cannot allocate to zero ratios.');
    }

    const total = ratios.reduce((sum, ratio) => sum + ratio, 0);

    if (total === 0) {
      throw new Error('Cannot allocate to zero ratios.');
    }

    const shares = ratios.map((ratio) => this.multipliedBy(ratio).dividedBy(total, RoundingMode.DOWN));
    let remainder = this.minus(shares.reduce((sum, share) => sum.plus(share), Money.zero(this.currency)));

    for (let i = 0; !remainder.isZero(); i++) {
      shares[i] = shares[i].plus(Money.ofMinor(1n, this.currency));
      remainder = remainder.minus(Money.ofMinor(1n, this.currency));
    }

    return shares;
  }

  /**
   * Gets the amount in minor currency units.
   * @returns {bigint} The amount in minor currency units.
   */
  getMinorAmount(): bigint {
    return this.amount;
  }

  /**
   * Gets the amount as a decimal string.
   * @returns {string} The amount as a decimal string.
   */
  getAmount(): string {
    const scaleFactor = BigInt(Math.pow(10, this.currency.getDefaultFractionDigits()));
    const integerPart = this.amount / scaleFactor;
    const fractionalPart = this.amount % scaleFactor;
    const absFractionalPart = fractionalPart < 0 ? -fractionalPart : fractionalPart;

    if (this.currency.getDefaultFractionDigits() === 0) {
      return integerPart.toString();
    }

    return `${integerPart}.${absFractionalPart.toString().padStart(this.currency.getDefaultFractionDigits(), '0')}`;
  }

  /**
   * Gets the currency of the monetary amount.
   * @returns {Currency} The currency of the monetary amount.
   */
  getCurrency(): Currency {
    return this.currency;
  }

  /**
   * Formats the monetary amount according to the given locale.
   * @param {string} locale - The locale to use for formatting.
   * @returns {string} The formatted monetary amount.
   */
  formatTo(locale: string): string {
    return new Intl.NumberFormat(locale, this.getFormatOptions()).format(this.bigintToNumber(this.amount));
  }

  /**
   * Formats the monetary amount with custom options.
   * @param {Intl.NumberFormatOptions} options - The custom formatting options.
   * @returns {string} The formatted monetary amount.
   */
  formatWith(options: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(undefined, { ...this.getFormatOptions(), ...options })
      .format(this.bigintToNumber(this.amount));
  }

  /**
   * Compares this Money instance to another.
   * @param {Money} other - The other Money instance to compare.
   * @returns {number} -1 if this is less than other, 0 if equal, 1 if greater.
   * @throws {Error} If the currencies are different.
   */
  compareTo(other: Money): number {
    this.assertSameCurrency(other);
    return this.amount < other.amount ? -1 : (this.amount > other.amount ? 1 : 0);
  }

  /**
   * Checks if this Money instance is greater than another.
   * @param {Money} other - The other Money instance to compare.
   * @returns {boolean} True if this is greater than other, false otherwise.
   * @throws {Error} If the currencies are different.
   */
  isGreaterThan(other: Money): boolean {
    return this.compareTo(other) === 1;
  }

  /**
   * Checks if this Money instance is greater than or equal to another.
   * @param {Money} other - The other Money instance to compare.
   * @returns {boolean} True if this is greater than or equal to other, false otherwise.
   * @throws {Error} If the currencies are different.
   */
  isGreaterThanOrSameAs(other: Money): boolean {
    return this.compareTo(other) === 1 || this.compareTo(other) === 0;
  }

  /**
   * Checks if this Money instance is less than another.
   * @param {Money} other - The other Money instance to compare.
   * @returns {boolean} True if this is less than other, false otherwise.
   * @throws {Error} If the currencies are different.
   */
  isLessThan(other: Money): boolean {
    return this.compareTo(other) === -1;
  }

  /**
   * Checks if this Money instance is less than or equal to another.
   * @param {Money} other - The other Money instance to compare.
   * @returns {boolean} True if this is less than or equal to other, false otherwise.
   * @throws {Error} If the currencies are different.
   */
  isLessThanOrSameAs(other: Money): boolean {
    return this.compareTo(other) === -1 || this.compareTo(other) === 0;
  }

  /**
   * Checks if this Money instance is equal to another.
   * @param {Money} other - The other Money instance to compare.
   * @returns {boolean} True if this is equal to other, false otherwise.
   * @throws {Error} If the currencies are different.
   */
  isSameAs(other: Money): boolean {
    return this.compareTo(other) === 0;
  }

  /**
   * Checks if the monetary amount is zero.
   * @returns {boolean} True if the amount is zero, false otherwise.
   */
  isZero(): boolean {
    return this.amount === 0n;
  }

  /**
   * Checks if the monetary amount is positive.
   * @returns {boolean} True if the amount is positive, false otherwise.
   */
  isPositive(): boolean {
    return this.amount > 0n;
  }

  /**
   * Checks if the monetary amount is negative.
   * @returns {boolean} True if the amount is negative, false otherwise.
   */
  isNegative(): boolean {
    return this.amount < 0n;
  }

  /**
   * Returns the absolute value of the monetary amount.
   * @returns {Money} A new Money instance with the absolute value.
   */
  abs(): Money {
    return this.isNegative() ? this.negated() : this;
  }

  /**
   * Returns the negated value of the monetary amount.
   * @returns {Money} A new Money instance with the negated value.
   */
  negated(): Money {
    return new Money(this.amount * -1n, this.currency);
  }

  /**
   * Asserts that the other Money instance has the same currency as this one.
   * @param {Money} other - The other Money instance to check.
   * @throws {Error} If the currencies are different.
   * @private
   */
  private assertSameCurrency(other: Money): void {
    if (!this.currency.is(other.currency)) {
      throw new Error('Cannot operate on Money with different currencies');
    }
  }

  /**
   * Gets the format options for number formatting.
   * @returns {Intl.NumberFormatOptions} The format options.
   * @private
   */
  private getFormatOptions(): Intl.NumberFormatOptions {
    return {
      style: 'currency',
      currency: this.currency.getCurrencyCode(),
      minimumFractionDigits: this.currency.getDefaultFractionDigits(),
      maximumFractionDigits: this.currency.getDefaultFractionDigits(),
    };
  }

  /**
   * Performs division with rounding.
   * @param {bigint} dividend - The dividend.
   * @param {bigint} divisor - The divisor.
   * @param {RoundingMode} roundingMode - The rounding mode to use.
   * @returns {bigint} The rounded result of the division.
   * @private
   */
  private roundDiv(dividend: bigint, divisor: bigint, roundingMode: RoundingMode): bigint {
    const quotient = dividend / divisor;
    const remainder = dividend % divisor;

    if (remainder === 0n) return quotient;

    const halfDivisor = divisor / 2n;

    switch (roundingMode) {
      case RoundingMode.UP:
        return quotient + 1n;
      case RoundingMode.DOWN:
        return quotient;
      case RoundingMode.CEILING:
        return dividend > 0n ? quotient + 1n : quotient;
      case RoundingMode.FLOOR:
        return dividend < 0n ? quotient - 1n : quotient;
      case RoundingMode.HALF_UP:
        return remainder >= halfDivisor ? quotient + 1n : quotient;
      case RoundingMode.HALF_DOWN:
        return remainder > halfDivisor ? quotient + 1n : quotient;
      case RoundingMode.HALF_EVEN:
        return remainder > halfDivisor || (remainder === halfDivisor && quotient % 2n !== 0n) ? quotient + 1n : quotient;
    }
  }

  /**
   * Converts a bigint to a number.
   * @param {bigint} value - The bigint value to convert.
   * @returns {number} The converted number.
   * @private
   */
  private bigintToNumber(value: bigint): number {
    return Number(value) / Math.pow(10, this.currency.getDefaultFractionDigits());
  }

  /**
   * Converts a number or string to a bigint with a specified scale.
   * @param {number | string} value - The value to convert.
   * @param {number} scale - The scale to use.
   * @returns {bigint} The converted bigint.
   * @private
   */
  private toBigIntWithScale(value: number | string, scale: number): bigint {
    return BigInt(Math.round(Number(value) * Math.pow(10, scale)));
  }
}

/**
 * Enumeration of rounding modes for monetary calculations.
 */
export enum RoundingMode {
  UP,
  DOWN,
  CEILING,
  FLOOR,
  HALF_UP,
  HALF_DOWN,
  HALF_EVEN,
}

/**
 * Enumeration of formats for percentage input
 */
export enum PercentageFormat {
  AS_DECIMAL, // For inputs like 0.15 (15%)
  AS_PERCENTAGE, // For inputs like 15 (15%)
}
