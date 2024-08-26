import { CountryCurrencyMapping, Currency, CurrencyEntry } from "../src/currency.ts";
import { assertEquals, assertThrows } from "jsr:@std/assert@1";

const mockCurrencyData: CurrencyEntry[] = [
  { code: 'USD', numericCode: 840, name: 'US Dollar', defaultFractionDigits: 2 },
  { code: 'EUR', numericCode: 978, name: 'Euro', defaultFractionDigits: 2 },
  { code: 'JPY', numericCode: 392, name: 'Japanese Yen', defaultFractionDigits: 0 },
  { code: 'CUP', numericCode: 192, name: 'Cuban Peso', defaultFractionDigits: 2 },
  { code: 'CUC', numericCode: 931, name: 'Peso Convertible', defaultFractionDigits: 2 },
  { code: 'INR', numericCode: 356, name: 'Indian Rupee', defaultFractionDigits: 2 },
];

const mockCountryCurrencyData: CountryCurrencyMapping[] = [
  { country: 'US', currencies: ['USD'] },
  { country: 'JP', currencies: ['JPY'] },
  { country: 'DE', currencies: ['EUR'] },
  { country: 'IN', currencies: ['INR'] },
  { country: 'CU', currencies: ['CUP', 'CUC'] },
];

Deno.test("Currency Class Tests", async (t) => {
  await t.step("loadIsoCurrencies", () => {
    Currency.loadIsoCurrencies(mockCurrencyData);
    assertEquals(Currency.of('USD').getName(), 'US Dollar');
    assertEquals(Currency.of('EUR').getNumericCode(), 978);
    assertEquals(Currency.of('JPY').getDefaultFractionDigits(), 0);
  });

  await t.step("loadCountryCurrencies", () => {
    Currency.loadCountryCurrencies(mockCountryCurrencyData);
    const usCurrencies = Currency.getCurrenciesByCountry('US');
    assertEquals(usCurrencies.map(c => c.getCurrencyCode()), ['USD']);
    const jpCurrencies = Currency.getCurrenciesByCountry('JP');
    assertEquals(jpCurrencies.map(c => c.getCurrencyCode()), ['JPY']);
    const cuCurrencies = Currency.getCurrenciesByCountry('CU');
    assertEquals(cuCurrencies.map(c => c.getCurrencyCode()), ['CUP', 'CUC']);
    assertThrows(() => Currency.getCurrenciesByCountry('XX'), Error, "Unknown country code: XX");
  });

  await t.step("of method", () => {
    const usd = Currency.of('USD');
    assertEquals(usd.getCurrencyCode(), 'USD');
    const eur = Currency.of(978);
    assertEquals(eur.getCurrencyCode(), 'EUR');
    assertThrows(() => Currency.of('XYZ'), Error, "Unknown currency: XYZ");
  });

  await t.step("getter methods", () => {
    const jpy = Currency.of('JPY');
    assertEquals(jpy.getCurrencyCode(), 'JPY');
    assertEquals(jpy.getNumericCode(), 392);
    assertEquals(jpy.getName(), 'Japanese Yen');
    assertEquals(jpy.getDefaultFractionDigits(), 0);
  });

  await t.step("is method", () => {
    const usd = Currency.of('USD');
    assertEquals(usd.is('USD'), true);
    assertEquals(usd.is(840), true);
    assertEquals(usd.is(Currency.of('USD')), true);
    assertEquals(usd.is('EUR'), false);
  });

  await t.step("toJSON and toString methods", () => {
    const eur = Currency.of('EUR');
    assertEquals(eur.toJSON(), 'EUR');
    assertEquals(eur.toString(), 'EUR');
  });
});
