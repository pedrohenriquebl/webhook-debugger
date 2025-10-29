import { db } from "./index";
import { webhooks } from "./schema";
import { faker } from "@faker-js/faker";
import { uuidv7 } from "uuidv7";

function randomStripeEvent() {
  const events = [
    "payment_intent.succeeded",
    "payment_intent.payment_failed",
    "charge.refunded",
    "invoice.payment_succeeded",
    "invoice.payment_failed",
    "invoice.created",
    "invoice.finalized",
    "customer.created",
    "customer.updated",
    "subscription.created",
    "subscription.updated",
    "payment_method.attached",
    "charge.dispute.created",
    "charge.dispute.closed",
    "payout.paid",
  ];
  return faker.helpers.arrayElement(events);
}

function randomCreatedAt(): Date {
  // distribution: some today, many within last week, some 8-14 days ago, some older
  const pick = faker.number.int({ min: 0, max: 99 });
  let daysAgo = 0;

  if (pick < 30) {
    // 30% -> today (0-1 days)
    daysAgo = faker.number.int({ min: 0, max: 0 });
  } else if (pick < 70) {
    // 40% -> within last 7 days
    daysAgo = faker.number.int({ min: 1, max: 6 });
  } else if (pick < 90) {
    // 20% -> 8-14 days ago
    daysAgo = faker.number.int({ min: 8, max: 14 });
  } else {
    // 10% -> older (15-60 days)
    daysAgo = faker.number.int({ min: 15, max: 60 });
  }

  // also randomize hours/minutes within the day
  const hours = faker.number.int({ min: 0, max: 23 });
  const minutes = faker.number.int({ min: 0, max: 59 });

  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

async function runSeed() {
  const samples: any[] = [];

  // keep a few realistic stripe-like entries
  for (let i = 0; i < 4; i++) {
    const type = randomStripeEvent();
    const rowId = uuidv7();
    const createdAt = randomCreatedAt();
    const bodyObj = {
      id: rowId,
      type,
      created: Math.floor(createdAt.getTime() / 1000),
      data: {
        object: {
          id: `obj_${faker.string.nanoid(8)}`,
          amount: faker.number.int({ min: 100, max: 200000 }),
          currency: faker.finance.currencyCode(),
          customer: `cus_${faker.string.nanoid(8)}`,
        },
      },
    };

    const body = JSON.stringify(bodyObj, null, 2);

    samples.push({
      id: rowId,
      method: "POST",
      pathname: "/stripe/events",
      ip: faker.internet.ip(),
      contentType: "application/json",
      contentLength: Buffer.byteLength(body, "utf8"),
      queryParams: {},
      headers: {
        "user-agent": "Stripe/1.0",
        "content-type": "application/json",
        "stripe-signature": faker.string.nanoid(40),
      },
      body,
      createdAt,
    });
  }

  // generate additional entries until we have at least 60
  const target = 60;
  while (samples.length < target) {
    const type = randomStripeEvent();

    const amount = faker.number.int({ min: 50, max: 500000 });
    const rowId = uuidv7();
    const createdAt = randomCreatedAt();
    const bodyObj: Record<string, any> = {
      id: rowId,
      type,
      created: Math.floor(createdAt.getTime() / 1000),
      data: {
        object: {
          id: `pi_${faker.string.nanoid(10)}`,
          amount,
          currency: faker.finance.currencyCode(),
          customer: `cus_${faker.string.nanoid(8)}`,
        },
      },
    };

    // Small variations per event type
    if (type.startsWith("invoice")) {
      bodyObj.data.object.invoice_number = faker.number
        .int({ min: 1000, max: 9999 })
        .toString();
    }
    if (type.includes("dispute") || type.includes("charge.refunded")) {
      bodyObj.data.object.refund = { id: `re_${faker.string.nanoid(8)}` };
    }

    const body = JSON.stringify(bodyObj);

    samples.push({
      id: rowId,
      method: "POST",
      pathname: "/stripe/events",
      ip: faker.internet.ip(),
      contentType: "application/json",
      contentLength: Buffer.byteLength(body, "utf8"),
      queryParams: {},
      headers: {
        "user-agent": "Stripe/1.0",
        "content-type": "application/json",
        "stripe-signature": faker.string.nanoid(48),
      },
      body,
      createdAt,
    });
  }

  try {
    const result = await db
      .insert(webhooks)
      .values(samples as any)
      .returning();
    console.log(`Seed inserted ${result.length} webhooks`);
  } catch (err) {
    console.error("Failed to run seed:", err);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  runSeed().then(() => process.exit());
}

export default runSeed;
