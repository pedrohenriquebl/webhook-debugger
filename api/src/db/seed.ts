import { db } from './index'
import { webhooks } from './schema'
import { faker } from '@faker-js/faker'
import { uuidv7 } from 'uuidv7'

function randomStripeEvent() {
  const events = [
    'payment_intent.succeeded',
    'payment_intent.payment_failed',
    'charge.refunded',
    'invoice.payment_succeeded',
    'invoice.payment_failed',
    'invoice.created',
    'invoice.finalized',
    'customer.created',
    'customer.updated',
    'subscription.created',
    'subscription.updated',
    'payment_method.attached',
    'charge.dispute.created',
    'charge.dispute.closed',
    'payout.paid',
  ]
  return faker.helpers.arrayElement(events)
}

function randomCreatedAt(): Date {
  const pick = faker.number.int({ min: 0, max: 99 })
  let daysAgo = 0

  if (pick < 30) {
    daysAgo = faker.number.int({ min: 0, max: 1 })
  } else if (pick < 70) {
    daysAgo = faker.number.int({ min: 2, max: 7 })
  } else if (pick < 90) {
    daysAgo = faker.number.int({ min: 8, max: 14 })
  } else {
    daysAgo = faker.number.int({ min: 15, max: 60 })
  }

  const hours = faker.number.int({ min: 0, max: 23 })
  const minutes = faker.number.int({ min: 0, max: 59 })

  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(hours, minutes, 0, 0)
  return d
}

// Novo: gera params aleatórios (ou vazio)
function randomQueryParams() {
  const shouldHaveParams = faker.datatype.boolean({ probability: 0.3 }) // ~30% terão query params
  if (!shouldHaveParams) return {}

  const count = faker.number.int({ min: 1, max: 3 })
  const params: Record<string, string> = {}
  for (let i = 0; i < count; i++) {
    const key = faker.helpers.arrayElement([
      'customer_id',
      'session_id',
      'invoice_id',
      'ref',
      'utm_source',
      'env',
    ])
    const value = faker.string.alphanumeric({ length: 6 }).toLowerCase()
    params[key] = value
  }
  return params
}

async function runSeed() {
  console.log('Seeding database...')
  await db.delete(webhooks)
  const samples: any[] = []

  // Alguns mais realistas
  for (let i = 0; i < 4; i++) {
    const type = randomStripeEvent()
    const rowId = uuidv7()
    const createdAt = randomCreatedAt()

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
    }

    const body = JSON.stringify(bodyObj, null, 2)

    samples.push({
      id: rowId,
      method: 'POST',
      pathname: '/stripe/events',
      ip: faker.internet.ip(),
      contentType: 'application/json',
      contentLength: Buffer.byteLength(body, 'utf8'),
      queryParams: randomQueryParams(),
      headers: {
        'user-agent': 'Stripe/1.0',
        'content-type': 'application/json',
        'stripe-signature': faker.string.nanoid(40),
      },
      body,
      createdAt,
    })
  }

  // até 60 registros com datas e params variados
  const target = 60
  while (samples.length < target) {
    const type = randomStripeEvent()
    const rowId = uuidv7()
    const createdAt = randomCreatedAt()
    const amount = faker.number.int({ min: 50, max: 500000 })

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
    }

    if (type.startsWith('invoice')) {
      bodyObj.data.object.invoice_number = faker.number
        .int({ min: 1000, max: 9999 })
        .toString()
    }
    if (type.includes('dispute') || type.includes('charge.refunded')) {
      bodyObj.data.object.refund = { id: `re_${faker.string.nanoid(8)}` }
    }

    const body = JSON.stringify(bodyObj)

    samples.push({
      id: rowId,
      method: 'POST',
      pathname: '/stripe/events',
      ip: faker.internet.ip(),
      contentType: 'application/json',
      contentLength: Buffer.byteLength(body, 'utf8'),
      queryParams: randomQueryParams(),
      headers: {
        'user-agent': 'Stripe/1.0',
        'content-type': 'application/json',
        'stripe-signature': faker.string.nanoid(48),
      },
      body,
      createdAt,
    })
  }

  try {
    const result = await db
      .insert(webhooks)
      .values(samples as any)
      .returning()
    console.log(`✅ Seed inseriu ${result.length} webhooks`)
  } catch (err) {
    console.error('❌ Falha ao rodar seed:', err)
    process.exitCode = 1
  }
}

if (require.main === module) {
  runSeed().then(() => process.exit())
}

export default runSeed
