# Money.ts - Stop Floating, Start Counting!

## Introduction

Handling money in programming can be as tricky as balancing your personal budget after a shopping spree. Small errors can lead to big problems, especially when floating-point arithmetic decides to play hide-and-seek with your decimals.

_Money.ts_ ensures your monetary calculations are as precise and reliable as your trusty calculator.

## The Problem: Floating-Point Fiascos

Imagine you're developing an e-commerce platform. You decide to use standard floating-point numbers for prices and totals, thinking, "What's the worst that could happen?" Let's take a look:

```typescript
let walletBalance = 100.00;
let itemPrice = 19.99;

walletBalance -= itemPrice;

console.log(walletBalance); // Outputs: 80.01000000000001

// Wait, what? Where did that extra cent come from?
```

Ah, the classic floating-point blunder. That rogue fraction of a cent might seem harmless, but scale it up, and you've got some serious accounting issues (and possibly some angry customers).

## The Solution: Precision with Money.ts

```typescript
import { Money } from "./money.ts";
import { Currency } from "./currency.ts";

Currency.loadIsoCurrencies([
  { code: "USD", numericCode: 840, name: "US Dollar", defaultFractionDigits: 2 },
]);

const usd = Currency.of("USD");
let walletBalance = Money.of(100, usd);
let itemPrice = Money.of(19.99, usd);

walletBalance = walletBalance.minus(itemPrice);

console.log(walletBalance.toString()); // Outputs: USD 80.01

// All cents accounted for, as they should be.
```

Now that's more like it! Your financial calculations stay accurate, ensuring every cent lands where it should.

---

## Currency.ts

Before you can manage money effectively, you need to understand the currencies you're dealing with. This is where Currency.ts comes in, allowing you to define and work with various currencies seamlessly.

### Loading Currency Data

First things first, let's introduce our application to the currencies it will handle.

```typescript
import { Currency, CurrencyEntry } from "./currency.ts";

// a complete list can be found at data/is-currencies.ts
const currencyData: CurrencyEntry[] = [
  { code: "USD", numericCode: 840, name: "US Dollar", defaultFractionDigits: 2 },
  { code: "EUR", numericCode: 978, name: "Euro", defaultFractionDigits: 2 },
  { code: "JPY", numericCode: 392, name: "Japanese Yen", defaultFractionDigits: 0 },
];

Currency.loadIsoCurrencies(currencyData);
```

_Boom!_ Your application now fluently speaks USD, EUR, and JPY. No more confusing dollars with yen — unless you're into that sort of chaos.

### Working with Currencies

Retrieving and using currency information is straightforward:

```typescript
const usd = Currency.of("USD");
console.log(usd.getName()); // Outputs: US Dollar
console.log(usd.getDefaultFractionDigits()); // Outputs: 2

const eur = Currency.of(978);
console.log(eur.getCurrencyCode()); // Outputs: EUR
```

Whether you have the currency code or numeric code, you'll get the right currency every time.

### Mapping Currencies to Countries

Need to know which currencies are used in which countries?

```typescript
const countryCurrencyData = [
  { country: "US", currencies: ["USD"] },
  { country: "DE", currencies: ["EUR"] },
  { country: "JP", currencies: ["JPY"] },
];

Currency.loadCountryCurrencies(countryCurrencyData);

const usCurrencies = Currency.getCurrenciesByCountry("US");
console.log(usCurrencies.map(c => c.getCurrencyCode())); // Outputs: ['USD']
```

Now your application can smartly handle transactions based on geographic locations.

---

## Money.ts

With currencies well-defined, it's time to handle actual monetary values. Money.ts ensures that all your financial computations are accurate, consistent, and free from those pesky floating-point errors.

### Creating Money Instances

Creating money amounts is simple and intuitive:

```typescript
const tenDollars = Money.of(10, usd);
const twentyEuros = Money.of(20, eur);
const fiveThousandYen = Money.of(5000, Currency.of("JPY"));

console.log(tenDollars.toString()); // Outputs: USD 10.00
console.log(twentyEuros.toString()); // Outputs: EUR 20.00
console.log(fiveThousandYen.toString()); // Outputs: JPY 5000
```

Your money values are now precisely represented, down to the last cent or yen.

### Basic Arithmetic Operations

#### Addition

Adding money amounts together? Easy peasy.

```typescript
const paycheck = Money.of(1500, usd);
const bonus = Money.of(200, usd);

const totalPay = paycheck.plus(bonus);
console.log(totalPay.toString()); // Outputs: USD 1700.00
```

#### Subtraction

Subtracting expenses is just as straightforward.

```typescript
const rent = Money.of(800, usd);
const groceries = Money.of(150.75, usd);

let remainingBalance = totalPay.minus(rent).minus(groceries);
console.log(remainingBalance.toString()); // Outputs: USD 749.25
```

#### Multiplication

Calculating taxes or discounts? No problem.

```typescript
const taxRate = 0.07;
const taxAmount = totalPay.multipliedBy(taxRate);

console.log(taxAmount.toString()); // Outputs: USD 119.00
```

#### Division

```typescript
const dinnerBill = Money.of(85.50, usd);

const amount = dinnerBill.dividedBy(3);
console.log(amount.toString()); // Outputs: USD 28.50
```

---

### Money Allocation

When working with money, you might need to allocate an amount based on specific ratios. _Money.ts_ handles these scenarios with precision, ensuring that every cent is accounted for, even when dealing with remainders.

#### Splitting Money

If you need to divide money into equal parts and distribute any remainder, use the `split()` method:

```typescript
const amount = Money.of(100, usd);
const [part1, part2, part3] = amount.split(3);

console.log(part1.toString()); // Outputs: USD 33.34
console.log(part2.toString()); // Outputs: USD 33.33
console.log(part3.toString()); // Outputs: USD 33.33
```

The `split()` method divides the `Money` object into the specified number of equal parts, ensuring that any remainder is distributed fairly among the parts.

#### Allocating Money by Ratios

Sometimes, you need to allocate money based on specific ratios, such as distributing profits among shareholders. The `allocate()` method is designed for this purpose:

```typescript
const profit = Money.of(987.65, Currency.of("EUR"));
const [shareholderA, shareholderB, shareholderC] = profit.allocate(50, 30, 20);

console.log(shareholderA.toString()); // Outputs: EUR 493.83
console.log(shareholderB.toString()); // Outputs: EUR 296.30
console.log(shareholderC.toString()); // Outputs: EUR 197.52
```

The `allocate()` method divides the `Money` object according to the provided ratios, ensuring that the total amount is accurately distributed and any remainder is handled correctly.

---

### Currency Consistency Checks

```typescript
try {
  const mixedMoney = tenDollars.plus(twentyEuros);
} catch (error) {
  console.log("Error: Cannot perform operations on different currencies.");
  // Outputs: Error: Cannot perform operations on different currencies.
}
```

This ensures you don't accidentally add apples to oranges — or dollars to euros — keeping your calculations logically sound.

### Comparing Money Amounts

Need to compare amounts? Money.ts handles that with precision.

```typescript
const savings = Money.of(1000, usd);
const goal = Money.of(1500, usd);

if (savings.isLessThan(goal)) {
  console.log("Keep saving! You're not there yet.");
  // Outputs: Keep saving! You're not there yet.
}

if (totalPay.isGreaterThanOrEqualTo(goal)) {
  console.log("Goal reached! Time to celebrate.");
  // Outputs: Goal reached! Time to celebrate.
}
```

Certainly! Here’s the updated section on formatting, which now references `Intl.NumberFormat`:

---

### Formatting Money for Display

Presenting monetary values nicely formatted for users enhances readability and professionalism. Money.ts leverages the power of `Intl.NumberFormat` to handle localization and formatting of currency values.

```typescript
const amount = Money.of(1234567.89, usd);

console.log(amount.formatTo("en-US")); // Outputs: $1,234,567.89
console.log(amount.formatTo("de-DE")); // Outputs: 1.234.567,89 $
console.log(amount.formatWith({ currencyDisplay: "name" })); 
// Outputs: 1,234,567.89 US dollars
```

Using `Intl.NumberFormat`, the `Money.ts` library ensures that your monetary values are formatted according to the locale you specify. This makes it easier to present financial information in a way that's familiar to your users, no matter where they are in the world.

Your users will appreciate the clarity, and your app will look all the more polished.

---

## Storing and Retrieving Money Values in a Database

When working with monetary values in an application, it's common to store these values in a database. Here’s how you can effectively store and retrieve money values using Money.ts.

### Saving Money to a Database

Monetary values should be stored in the database as integers representing the smallest unit (e.g., cents for USD). This approach avoids potential rounding issues that can occur with floating-point storage.

```typescript
const amount = Money.of(123.45, usd);
const minorAmount = amount.getMinorAmount(); // 12345 (cents)

// Save `minorAmount` and `currencyCode` to your database
// INSERT INTO transactions (amount, currency) VALUES (12345, 'USD');
```

### Reading Money from a Database

When retrieving monetary values from a database, convert the stored integer back to a `Money` object.

```typescript
// Assume we fetch these from the database
const storedMinorAmount = 12345; // in cents
const storedCurrencyCode = 'USD';

const amount = Money.ofMinor(storedMinorAmount, Currency.of(storedCurrencyCode));

console.log(amount.toString()); // Outputs: USD 123.45
```

This method ensures that your monetary values are consistently and accurately represented, both in storage and in your application's logic.

---

## Real-World Example: Shopping Cart Calculation

Let's put it all together with a real-world scenario.

```typescript
import { Currency, Money } from "./money.ts";

// Load currencies
Currency.loadIsoCurrencies([
  { code: "USD", numericCode: 840, name: "US Dollar", defaultFractionDigits: 2 },
  { code: "EUR", numericCode: 978, name: "Euro", defaultFractionDigits: 2 },
]);

const usd = Currency.of("USD");

// Define items
const item1 = Money.of(29.99, usd);
const item2 = Money.of(49.99, usd);
const item3 = Money.of(19.99, usd);

// Calculate subtotal
const subtotal = item1.plus(item2).plus(item3);
console.log(subtotal.toString()); // Outputs: USD 99.97

// Apply discount
const discountRate = 0.1; // 10% discount
const discount = subtotal.multipliedBy(discountRate);
const totalAfterDiscount = subtotal.minus(discount);
console.log(totalAfterDiscount.toString()); // Outputs: USD 89.97

// Add tax
const taxRate = 0.08; // 8% tax
const tax = totalAfterDiscount.multipliedBy(taxRate);
const finalTotal = totalAfterDiscount.plus(tax);
console.log(finalTotal.toString()); // Outputs: USD 97.17

// Format for display
console.log(finalTotal.formatTo("en-US")); // Outputs: $97.17

// Save finalTotal to a database
const minorFinalTotal = finalTotal.getMinorAmount();
// INSERT INTO transactions (amount, currency) VALUES (9717, 'USD');
```

With these tools, complex financial calculations become manageable, accurate, and maintainable.

---

## Conclusion

This practical library helps you bring reliability and precision to financial computations in your applications. By eliminating floating-point errors and providing robust methods for handling various currencies and monetary operations, it ensures your code handles money as meticulously as a seasoned accountant.

---

### Credits

This library was inspired by the fantastic work done on [Brick\Money](https://github.com/brick/money). It has set a high bar for handling money with precision and reliability in PHP, and it was a major inspiration in bringing similar functionality to the TypeScript world. A big shout-out to the contributors of Brick\Money for providing such a solid foundation to build upon!

---

### Who is DNL?

DNL, short for 'Dots and Lines', is a venture created by Tino Ehrich, a seasoned digital carpenter with over 20 years of experience in crafting projects and assisting businesses. DNL will specifically focus on developing projects that aim to simplify the access of information, and to develop these in the open.

---

### License

Money.ts is free software, and is released under the terms of the [Mozilla Public License](https://www.mozilla.org/en-US/MPL/) version 2.0. See [LICENSE](LICENSE).