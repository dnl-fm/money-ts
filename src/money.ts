import { Currency } from './currency.ts';

export class Money {
  private amount: bigint;
  private readonly currency: Currency;

  constructor(amount: number | string | bigint, currency: Currency) {
    this.amount = typeof amount === 'bigint' ? amount : BigInt(Math.round(Number(amount) * Math.pow(10, currency.getDefaultFractionDigits())));
    this.currency = currency;
  }

  static of(amount: number | string, currency: Currency): Money {
    return new Money(amount, currency);
  }

  static ofMinor(minorAmount: number, currency: Currency): Money {
    return new Money(BigInt(minorAmount), currency);
  }

  toString(): string {
    return `${this.currency.getCurrencyCode()} ${this.getAmount()}`;
  }

  plus(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  minus(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  multipliedBy(factor: number | string): Money {
    const multiplier = BigInt(Math.round(Number(factor) * Math.pow(10, this.currency.getDefaultFractionDigits())));
    return new Money(this.amount * multiplier / BigInt(Math.pow(10, this.currency.getDefaultFractionDigits())), this.currency);
  }

  dividedBy(divisor: number | string, roundingMode: RoundingMode = RoundingMode.HALF_UP): Money {
    const scaleFactor = BigInt(Math.pow(10, this.currency.getDefaultFractionDigits()));
    const divisorBigInt = BigInt(Math.round(Number(divisor) * Number(scaleFactor)));
    return new Money(this.roundDiv(this.amount * scaleFactor, divisorBigInt, roundingMode), this.currency);
  }

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

  split(parts: number): Money[] {
    const equalParts = Array(parts).fill(1);
    return this.allocate(...equalParts);
  }

  allocate(...ratios: number[]): Money[] {
    if (ratios.length === 0) {
      throw new Error('Cannot allocate with an empty list of ratios.');
    }

    const total = ratios.reduce((sum, ratio) => sum + ratio, 0);
    if (total === 0) {
      throw new Error('Cannot allocate to zero ratios only.');
    }

    const shares = ratios.map((ratio) => this.amount * BigInt(ratio) / BigInt(total));
    let remainder = this.amount - shares.reduce((sum, share) => sum + share, 0n);

    const results = shares.map((share) => new Money(share, this.currency));

    // Distribute the remainder starting from the first share
    for (let i = 0; remainder > 0n; i++) {
      results[i] = new Money(results[i].getMinorAmount() + 1n, this.currency);
      remainder -= 1n;
    }

    return results;
  }

  getMinorAmount(): bigint {
    return this.amount;
  }

  getAmount(): string {
    const scaleFactor = BigInt(Math.pow(10, this.currency.getDefaultFractionDigits()));
    const integerPart = this.amount / scaleFactor;
    const fractionalPart = this.amount % scaleFactor;
    return this.currency.getDefaultFractionDigits() === 0 ? integerPart.toString() : `${integerPart}.${fractionalPart.toString().padStart(this.currency.getDefaultFractionDigits(), '0')}`;
  }

  getCurrency(): Currency {
    return this.currency;
  }

  private assertSameCurrency(other: Money): void {
    if (!this.currency.is(other.currency)) {
      throw new Error('Cannot operate on Money with different currencies');
    }
  }

  formatTo(locale: string): string {
    return new Intl.NumberFormat(locale, this.getFormatOptions()).format(this.bigintToNumber(this.amount));
  }

  formatWith(options: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(undefined, { ...this.getFormatOptions(), ...options })
      .format(this.bigintToNumber(this.amount));
  }

  private getFormatOptions(): Intl.NumberFormatOptions {
    return {
      style: 'currency',
      currency: this.currency.getCurrencyCode(),
      minimumFractionDigits: this.currency.getDefaultFractionDigits(),
      maximumFractionDigits: this.currency.getDefaultFractionDigits(),
    };
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency.is(other.currency);
  }

  compareTo(other: Money): number {
    this.assertSameCurrency(other);
    return this.amount < other.amount ? -1 : (this.amount > other.amount ? 1 : 0);
  }

  isZero(): boolean {
    return this.amount === 0n;
  }

  isPositive(): boolean {
    return this.amount > 0n;
  }

  isNegative(): boolean {
    return this.amount < 0n;
  }

  abs(): Money {
    return this.isNegative() ? this.negated() : this;
  }

  negated(): Money {
    return new Money(this.amount * -1n, this.currency);
  }

  private bigintToNumber(value: bigint): number {
    return Number(value) / Math.pow(10, this.currency.getDefaultFractionDigits());
  }
}

export enum RoundingMode {
  UP,
  DOWN,
  CEILING,
  FLOOR,
  HALF_UP,
  HALF_DOWN,
  HALF_EVEN,
}
