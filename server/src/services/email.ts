import { Resend } from 'resend'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Lantana <notifications@myriapods.com>'

// ── Shared template ──────────────────────────────────────────────────────────

function emailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    </head>
    <body style="margin:0; padding:0; background-color:#F6F3F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6F3F9; padding: 40px 16px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

              <!-- Logo bar -->
              <tr>
                <td style="padding-bottom: 24px;">
                  <span style="font-size: 22px; font-weight: 700; color: #2e1a47; letter-spacing: -0.5px;">Lantana</span>
                </td>
              </tr>

              <!-- Card -->
              <tr>
                <td style="background:#ffffff; border-radius: 20px; border: 1px solid #E3DFEF; padding: 40px; box-shadow: 0 2px 8px rgba(46,26,71,0.08);">
                  ${content}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding-top: 28px; text-align: center;">
                  <p style="margin:0; font-size:12px; color:#AFABC9;">
                    © 2026 Lantana · Secure. Straightforward. Fast.
                  </p>
                  <p style="margin: 6px 0 0; font-size:12px; color:#AFABC9;">
                    You're receiving this because you have an account on Lantana.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

// Reusable pill badge at the top of each email
function badge(text: string, color = '#72569C'): string {
  return `
    <p style="margin: 0 0 20px;">
      <span style="display:inline-block; background-color: ${color}1a; color: ${color}; font-size: 11px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 4px 12px; border-radius: 999px; border: 1px solid ${color}33;">
        ${text}
      </span>
    </p>
  `
}

// Info box (neutral, warning, or danger)
function infoBox(content: string, variant: 'neutral' | 'danger' = 'neutral'): string {
  const styles = {
    neutral: { bg: '#F6F3F9', border: '#E3DFEF' },
    danger:  { bg: '#fff5f5', border: '#fecaca' },
  }
  const { bg, border } = styles[variant]
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background:${bg}; border:1px solid ${border}; border-radius:12px; margin: 20px 0;">
      <tr><td style="padding: 20px 24px;">${content}</td></tr>
    </table>
  `
}

function infoRow(label: string, value: string): string {
  return `<p style="margin: 0 0 10px; font-size: 14px; color: #2e1a47;"><span style="color:#7c6992;">${label}</span> &nbsp;${value}</p>`
}

function ctaButton(text: string, href = 'https://myriapods.com'): string {
  return `
    <table cellpadding="0" cellspacing="0" style="margin-top: 28px;">
      <tr>
        <td style="background-color:#2e1a47; border-radius:999px; padding: 12px 28px;">
          <a href="${href}" style="color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; display:inline-block;">${text}</a>
        </td>
      </tr>
    </table>
  `
}

function heading(text: string): string {
  return `<h1 style="margin: 0 0 12px; font-size: 22px; font-weight: 700; color: #2e1a47; letter-spacing: -0.3px; line-height: 1.3;">${text}</h1>`
}

function body(text: string): string {
  return `<p style="margin: 0 0 12px; font-size: 14px; color: #7c6992; line-height: 1.6;">${text}</p>`
}

function divider(): string {
  return `<div style="border-top: 1px solid #E3DFEF; margin: 24px 0;"></div>`
}

// ── Emails ───────────────────────────────────────────────────────────────────

export async function sendBidReceivedEmail(
  sellerEmail: string,
  sellerName: string,
  brand: string,
  faceValue: number,
  bidType: string,
  cashAmount: number | null
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: sellerEmail,
    subject: `New bid on your ${brand} gift card`,
    html: emailWrapper(`
      ${badge('New Bid')}
      ${heading('You received a bid')}
      ${body(`Hi ${sellerName ?? 'there'}, someone placed a bid on your <strong style="color:#2e1a47;">${brand}</strong> gift card.`)}
      ${divider()}
      ${infoBox(`
        ${infoRow('Card:', `${brand} · $${faceValue.toFixed(2)} face value`)}
        ${infoRow('Bid type:', bidType === 'CASH' ? 'Cash offer' : 'Exchange offer')}
        ${cashAmount ? infoRow('Amount offered:', `$${cashAmount.toFixed(2)}`) : ''}
      `)}
      ${body('Log in to review the bid and decide whether to accept or decline.')}
      ${ctaButton('View bid on Lantana')}
    `)
  })
}

export async function sendCardRejectedEmail(
  userEmail: string,
  userName: string,
  brand: string,
  faceValue: number,
  reason: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: userEmail,
    subject: `Your ${brand} gift card could not be verified`,
    html: emailWrapper(`
      ${badge('Verification Failed', '#dc2626')}
      ${heading('Card could not be verified')}
      ${body(`Hi ${userName ?? 'there'}, your <strong style="color:#2e1a47;">${brand}</strong> gift card worth $${faceValue.toFixed(2)} didn't pass verification.`)}
      ${divider()}
      ${infoBox(`${infoRow('Reason:', reason)}`, 'danger')}
      ${body('You can resubmit your card with corrected details from your dashboard.')}
      ${ctaButton('Go to dashboard')}
    `)
  })
}

export async function sendBidAcceptedEmail(
  buyerEmail: string,
  buyerName: string,
  brand: string,
  faceValue: number
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: buyerEmail,
    subject: `Your bid on a ${brand} gift card was accepted`,
    html: emailWrapper(`
      ${badge('Bid Accepted', '#16a34a')}
      ${heading('Your bid was accepted 🎉')}
      ${body(`Hi ${buyerName ?? 'there'}, the seller accepted your bid on a <strong style="color:#2e1a47;">${brand}</strong> gift card worth $${faceValue.toFixed(2)}.`)}
      ${divider()}
      ${body('Log in to complete the trade and receive your card details.')}
      ${ctaButton('Complete trade on Lantana')}
    `)
  })
}

export async function sendBidRejectedEmail(
  buyerEmail: string,
  buyerName: string,
  brand: string,
  faceValue: number
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: buyerEmail,
    subject: `Your bid on a ${brand} gift card was not accepted`,
    html: emailWrapper(`
      ${badge('Bid Declined', '#7c6992')}
      ${heading('Your bid was not accepted')}
      ${body(`Hi ${buyerName ?? 'there'}, the seller passed on your bid for a <strong style="color:#2e1a47;">${brand}</strong> gift card worth $${faceValue.toFixed(2)}.`)}
      ${divider()}
      ${body('There are plenty of other listings available — find your next card below.')}
      ${ctaButton('Browse listings')}
    `)
  })
}

export async function sendCardSoldEmail(
  sellerEmail: string,
  sellerName: string,
  brand: string,
  faceValue: number,
  salePrice: number
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: sellerEmail,
    subject: `Your ${brand} gift card sold`,
    html: emailWrapper(`
      ${badge('Card Sold', '#16a34a')}
      ${heading('Your card sold 🎉')}
      ${body(`Hi ${sellerName ?? 'there'}, your <strong style="color:#2e1a47;">${brand}</strong> gift card has been purchased.`)}
      ${divider()}
      ${infoBox(`
        ${infoRow('Card:', `${brand} · $${faceValue.toFixed(2)} face value`)}
        ${infoRow('Sale price:', `$${salePrice.toFixed(2)}`)}
      `)}
      ${body('Log in to complete the transaction and transfer the card details to the buyer.')}
      ${ctaButton('Complete transaction')}
    `)
  })
}

export async function sendContactEmail(
  name: string,
  email: string,
  subject: string,
  message: string,
  reportedUser?: string
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: 'jousuealan@gmail.com',
    replyTo: email,
    subject: `[Lantana Support] ${subject}`,
    html: emailWrapper(`
      ${badge('Support Request')}
      ${heading('New support message')}
      ${divider()}
      ${infoBox(`
        ${infoRow('Name:', name)}
        ${infoRow('Email:', email)}
        ${infoRow('Subject:', subject)}
        ${reportedUser ? `${infoRow('Reported user:', `<span style="color:#dc2626;">@${reportedUser}</span>`)}` : ''}
      `)}
      <p style="margin: 0 0 8px; font-size:13px; font-weight:600; color:#7c6992; text-transform:uppercase; letter-spacing:0.06em;">Message</p>
      <p style="margin:0; font-size:14px; color:#2e1a47; line-height:1.6; white-space: pre-wrap;">${message}</p>
    `)
  })
}

export async function sendCardDetailsEmail(
  buyerEmail: string,
  buyerName: string,
  brand: string,
  cardNumber: string,
  pin: string,
  faceValue: number
) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: buyerEmail,
    subject: `Your ${brand} gift card is ready`,
    html: emailWrapper(`
      ${badge('Card Ready', '#16a34a')}
      ${heading('Your card is ready to use')}
      ${body(`Hi ${buyerName}, your <strong style="color:#2e1a47;">${brand}</strong> gift card worth $${faceValue.toFixed(2)} is all yours.`)}
      ${divider()}
      ${infoBox(`
        ${infoRow('Card number:', `<strong style="font-family: monospace; letter-spacing: 0.1em;">${cardNumber}</strong>`)}
        ${infoRow('PIN:', `<strong style="font-family: monospace; letter-spacing: 0.1em;">${pin}</strong>`)}
      `)}
      <p style="margin: 20px 0 0; font-size:12px; color:#AFABC9; line-height:1.6;">
        Keep this email safe. These details will not be shown again on Lantana.
      </p>
    `)
  })
}