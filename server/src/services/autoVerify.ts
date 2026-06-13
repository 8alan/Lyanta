import puppeteer from 'puppeteer-core'

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN!

export async function verifyStarbucks(cardNumber: string, pin: string): Promise<{ verified: boolean, balance?: number, error?: string }> {
  let browser
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`,
    })

    const page = await browser.newPage()
    await page.goto('https://www.starbucks.com/gift', { waitUntil: 'networkidle2', timeout: 30000 })
    // Dismiss cookie banner if present
    try {
    await page.waitForSelector('#truste-consent-button', { timeout: 5000 })
    await page.click('#truste-consent-button')
    await new Promise(resolve => setTimeout(resolve, 1000))
    } catch {
    // No cookie banner, continue
    }

    // Click the balance check link
    await page.waitForSelector('[data-e2e="check-balance-button"]', { timeout: 10000 })
    await page.click('[data-e2e="check-balance-button"]')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    await page.screenshot({ path: '/tmp/starbucks-debug.png' })
    

    // Enter card number
    await page.waitForSelector('input[name="cardNumber"]', { timeout: 10000 })
    await page.type('input[name="cardNumber"]', cardNumber)

    // Enter PIN
    await page.waitForSelector('input[name="securityCode"]', { timeout: 10000 })
    await page.type('input[name="securityCode"]', pin)

    // Submit
    await page.click('button[type="submit"]')

    // Wait for balance report
    await page.waitForSelector('[data-e2e="balanceReport"]', { timeout: 15000 })

    // Parse balance
    const balance = await page.evaluate(() => {
      const el = document.querySelector('[data-e2e="balanceReport"] span')
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