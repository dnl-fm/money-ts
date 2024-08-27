import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { Currency, CurrencyEntry } from "../src/currency.ts";
import { Money, RoundingMode } from "../src/money.ts";

const mockCurrencyData: CurrencyEntry[] = [
  { code: 'USD', numericCode: 840, name: 'US Dollar', defaultFractionDigits: 2 },
  { code: 'EUR', numericCode: 978, name: 'Euro', defaultFractionDigits: 2 },
  { code: 'JPY', numericCode: 392, name: 'Japanese Yen', defaultFractionDigits: 0 },
  { code: 'CHF', numericCode: 756, name: 'Swiss Franc', defaultFractionDigits: 2 },
  { code: 'BHD', numericCode: 48, name: 'Bahraini Dinar', defaultFractionDigits: 3 },
];

Currency.loadIsoCurrencies(mockCurrencyData);

Deno.test("Money Class Tests", async (t) => {
  await t.step("constructor and of method", () => {
    const money = new Money(10.50, Currency.of('USD'));
    assertEquals(money.toString(), 'USD 10.50');
    const moneyOf = Money.of(10.50, Currency.of('USD'));
    assertEquals(moneyOf.toString(), 'USD 10.50');
  });

  await t.step("ofMinor method", () => {
    const usd = Money.ofMinor(1050n, Currency.of('USD'));
    assertEquals(usd.toString(), 'USD 10.50');

    const jpy = Money.ofMinor(1050n, Currency.of('JPY'));
    assertEquals(jpy.toString(), 'JPY 1050');
  });
  
  await t.step("plus method", () => {
    const money1 = Money.of(10.50, Currency.of('USD'));
    const money2 = Money.of(5.25, Currency.of('USD'));
    const result = money1.plus(money2);
    assertEquals(result.toString(), 'USD 15.75');
    assertThrows(() => money1.plus(Money.of(5, Currency.of('EUR'))), Error, "Cannot operate on Money with different currencies");
  });

  await t.step("minus method", () => {
    const money1 = Money.of(10.50, Currency.of('USD'));
    const money2 = Money.of(5.25, Currency.of('USD'));
    const result = money1.minus(money2);
    assertEquals(result.toString(), 'USD 5.25');
  });

  await t.step("multipliedBy method", () => {
    const money = Money.of(10, Currency.of('USD'));
    const result = money.multipliedBy(2.5);
    assertEquals(result.toString(), 'USD 25.00');
  });

  await t.step("dividedBy method", () => {
    const money = Money.of(10, Currency.of('USD'));
    const result = money.dividedBy(4);
    assertEquals(result.toString(), 'USD 2.50');
  });

  await t.step("allocate method", () => {
    const money = Money.of(10, Currency.of('USD'));
    const allocated = money.allocate(1, 1, 2);
    assertEquals(allocated.map(m => m.toString()), ['USD 2.50', 'USD 2.50', 'USD 5.00']);
  });

  // New test for split method
  await t.step("split method", () => {
    const money = Money.of(100, Currency.of('USD'));
    const [part1, part2, part3] = money.split(3);
    assertEquals(part1.toString(), 'USD 33.34');
    assertEquals(part2.toString(), 'USD 33.33');
    assertEquals(part3.toString(), 'USD 33.33');
  });

  await t.step("allocate method with different ratios", () => {
    const money = Money.of(987.65, Currency.of('CHF'));
    const [shareholderA, shareholderB, shareholderC] = money.allocate(48, 41, 11);
    assertEquals(shareholderA.toString(), 'CHF 474.08');
    assertEquals(shareholderB.toString(), 'CHF 404.93');
    assertEquals(shareholderC.toString(), 'CHF 108.64');
  });

  await t.step("getMinorAmount and getAmount methods", () => {
    const money = Money.of(10.50, Currency.of('USD'));
    assertEquals(money.getMinorAmount(), 1050n);
    assertEquals(money.getAmount(), '10.50');
  });

  await t.step("getCurrency method", () => {
    const money = Money.of(10.50, Currency.of('USD'));
    assertEquals(money.getCurrency(), Currency.of('USD'));
  });

  await t.step("formatTo method", () => {
    const money = Money.of(1234.56, Currency.of('USD'));
    const formattedUS = money.formatTo('en-US');
    assertEquals(formattedUS.replace(/\s/g, ''), '$1,234.56'.replace(/\s/g, ''));

    const formattedDE = money.formatTo('de-DE');
    assertEquals(formattedDE.replace(/\s/g, ''), '1.234,56$'.replace(/\s/g, ''));
  });

  await t.step("formatWith method", () => {
    const money = Money.of(1234.56, Currency.of('USD'));
    const result = money.formatWith({
      currencyDisplay: 'name',
      minimumFractionDigits: 2,
    });
    assertEquals(result.replace(/\s/g, '').toLowerCase(), '1,234.56usdollars');
  });
  
  await t.step("equals method", () => {
    const money1 = Money.of(10.50, Currency.of('USD'));
    const money2 = Money.of(10.50, Currency.of('USD'));
    const money3 = Money.of(10.50, Currency.of('EUR'));
    assertEquals(money1.equals(money2), true);
    assertEquals(money1.equals(money3), false);
  });

  await t.step("compareTo method", () => {
    const money1 = Money.of(10.50, Currency.of('USD'));
    const money2 = Money.of(5.25, Currency.of('USD'));
    assertEquals(money1.compareTo(money2), 1);
    assertEquals(money2.compareTo(money1), -1);
    assertEquals(money1.compareTo(money1), 0);
  });

  await t.step("isZero, isPositive, isNegative methods", () => {
    const zero = Money.of(0, Currency.of('USD'));
    const positive = Money.of(10, Currency.of('USD'));
    const negative = Money.of(-10, Currency.of('USD'));
    assertEquals(zero.isZero(), true);
    assertEquals(positive.isPositive(), true);
    assertEquals(negative.isNegative(), true);
  });

  await t.step("abs and negated methods", () => {
    const negative = Money.of(-10, Currency.of('USD'));
    assertEquals(negative.abs().toString(), 'USD 10.00');
    assertEquals(negative.negated().toString(), 'USD 10.00');
  });

  await t.step("rounding modes in dividedBy method", () => {
    const money = Money.of(10, Currency.of('USD'));
    assertEquals(money.dividedBy(3, RoundingMode.FLOOR).toString(), 'USD 3.33');
    assertEquals(money.dividedBy(3, RoundingMode.CEILING).toString(), 'USD 3.34');
    assertEquals(money.dividedBy(3, RoundingMode.HALF_UP).toString(), 'USD 3.33');
  });

  await t.step("zero method", () => {
    const zeroUSD = Money.zero('USD');
    assertEquals(zeroUSD.toString(), 'USD 0.00');
    const zeroBHD = Money.zero(Currency.of('BHD'));
    assertEquals(zeroBHD.toString(), 'BHD 0.000');
  });

  await t.step("handling large amounts", () => {
    const largeMoney = Money.of(1000000000.00, Currency.of('USD'));
    assertEquals(largeMoney.toString(), 'USD 1000000000.00');
  });

  await t.step("handling small amounts", () => {
    const smallMoney = Money.of(0.00000001, Currency.of('USD'));
    assertEquals(smallMoney.toString(), 'USD 0.00');
    const smallBHD = Money.of(0.00000001, Currency.of('BHD'));
    assertEquals(smallBHD.toString(), 'BHD 0.000');
  });

  await t.step("different decimal places", () => {
    const usd = Money.of(100, Currency.of('USD'));
    const jpy = Money.of(100, Currency.of('JPY'));
    const bhd = Money.of(100, Currency.of('BHD'));
    assertEquals(usd.toString(), 'USD 100.00');
    assertEquals(jpy.toString(), 'JPY 100');
    assertEquals(bhd.toString(), 'BHD 100.000');
  });

  await t.step("invalid input to constructor", () => {
    assertThrows(() => Money.of('invalid', Currency.of('USD')), Error);
    assertThrows(() => new Money({} as any, Currency.of('USD')), Error);
  });

  await t.step("division by zero", () => {
    const money = Money.of(100, Currency.of('USD'));
    assertThrows(() => money.dividedBy(0), Error);
  });

  await t.step("invalid currency code", () => {
    assertThrows(() => Currency.of('INVALID'), Error);
  });

  await t.step("immutability after operations", () => {
    const original = Money.of(100, Currency.of('USD'));
    const added = original.plus(Money.of(50, Currency.of('USD')));
    assertEquals(original.toString(), 'USD 100.00');
    assertEquals(added.toString(), 'USD 150.00');
  });

  await t.step("rounding behavior in arithmetic operations", () => {
    const money = Money.of(10.005, Currency.of('USD'));
    assertEquals(money.toString(), 'USD 10.01');
    assertEquals(money.plus(Money.of(0.005, Currency.of('USD'))).toString(), 'USD 10.02');
    assertEquals(money.minus(Money.of(0.005, Currency.of('USD'))).toString(), 'USD 10.00');
  });

  await t.step("allocate with zero ratio", () => {
    const money = Money.of(100, Currency.of('USD'));
    assertThrows(
      () => money.allocate(0),
      Error,
      "Cannot allocate to zero ratios."
    );
    assertThrows(
      () => money.allocate(1, 0, 1),
      Error,
      "Cannot allocate to zero ratios."
    );
  });
  
  await t.step("allocate with negative ratio", () => {
    const money = Money.of(100, Currency.of('USD'));
    assertThrows(() => money.allocate(-1), Error);
    assertThrows(() => money.allocate(1, -1, 1), Error);
  });

  await t.step("split with invalid parts", () => {
    const money = Money.of(100, Currency.of('USD'));
    assertThrows(() => money.split(0), Error);
    assertThrows(() => money.split(-1), Error);
  });

  await t.step("compareTo with different currencies", () => {
    const usd = Money.of(100, Currency.of('USD'));
    const eur = Money.of(100, Currency.of('EUR'));
    assertThrows(() => usd.compareTo(eur), Error);
  });
});
