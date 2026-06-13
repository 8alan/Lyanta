import puppeteer from 'puppeteer-core'

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN!

export async function verifyStarbucks(cardNumber: string, pin: string): Promise<{ verified: boolean, balance?: number, error?: string }> {
  let browser
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`,
    })

    const page = await browser.newPage()
    await page.goto('https://www.starbucks.com/card/balance', { waitUntil: 'networkidle2', timeout: 30000 })

    // Enter card number
    await page.waitForSelector('input[name="cardNumber"]', { timeout: 10000 })
    await page.type('input[name="cardNumber"]', cardNumber)

    // Enter PIN
    await page.waitForSelector('input[name="cardPin"]', { timeout: 10000 })
    await page.type('input[name="cardPin"]', pin)

    // Submit
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
      page.click('button[type="submit"]')
    ])

    // Parse balance
    const balance = await page.evaluate(() => {
      const el = document.querySelector('[data-e2e="balance-amount"]')
      if (!el) return null
      const text = el.textContent?.replace(/[^0-9.]/g, '')
      return text ? parseFloat(text) : null
    })

    if (balance === null) {
      return { verified: false, error: 'Could not read balance from page' }
    }

    return { verified: true, balance }
  } catch (err) {
    console.error('Starbucks verification error:', err)
    return { verified: false, error: 'Verification failed' }
  } finally {
    if (browser) await browser.disconnect()
  }
}

export async function autoVerify(brand: string, cardNumber: string, pin: string): Promise<{ verified: boolean, balance?: number, error?: string }> {
  switch (brand) {
    case 'Starbucks':
      return verifyStarbucks(cardNumber, pin)
    default:
      return { verified: false, error: 'Auto-verification not supported for this brand' }
  }
}