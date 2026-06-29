import { Resend } from 'resend'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'Lantana <jousuealan@gmail.com>'

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
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a2e;">You have a new bid</h2>
        <p style="color: #4a4a6a; font-size: 14px;">
          Hi ${sellerName ?? 'there'}, someone has placed a bid on your ${brand} gift card worth $${faceValue.toFixed(2)}.
        </p>
        <div style="background: #f8f7f4; border: 1px solid #e2e0db; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #1a1a2e;">
            <strong>Bid type:</strong> ${bidType === 'CASH' ? 'Cash offer' : 'Exchange offer'}
          </p>
          ${cashAmount ? `<p style="margin: 8px 0 0; font-size: 14px; color: #1a1a2e;"><strong>Amount:</strong> $${cashAmount.toFixed(2)}</p>` : ''}
        </div>
        <p style="color: #4a4a6a; font-size: 14px;">
          Log in to Lantana to accept or reject this bid.
        </p>
      </div>
    `
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
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a2e;">Card verification failed</h2>
        <p style="color: #4a4a6a; font-size: 14px;">
          Hi ${userName ?? 'there'}, unfortunately your ${brand} gift card worth $${faceValue.toFixed(2)} could not be verified.
        </p>
        <div style="background: #fff5f5; border: 1px solid #fecaca; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; font-size: 14px; color: #1a1a2e;">
            <strong>Reason:</strong> ${reason}
          </p>
        </div>
        <p style="color: #4a4a6a; font-size: 14px;">
          You can resubmit your card with corrected details from your dashboard.
        </p>
      </div>
    `
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
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a2e;">Your bid was accepted</h2>
        <p style="color: #4a4a6a; font-size: 14px;">
          Hi ${buyerName ?? 'there'}, your bid on a ${brand} gift card worth $${faceValue.toFixed(2)} has been accepted.
        </p>
        <p style="color: #4a4a6a; font-size: 14px;">
          Log in to Lantana to complete the trade and receive your card details.
        </p>
      </div>
    `
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
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a2e;">Your bid was not accepted</h2>
        <p style="color: #4a4a6a; font-size: 14px;">
          Hi ${buyerName ?? 'there'}, your bid on a ${brand} gift card worth $${faceValue.toFixed(2)} was not accepted by the seller.
        </p>
        <p style="color: #4a4a6a; font-size: 14px;">
          Browse other listings on Lantana to find another card.
        </p>
      </div>
    `
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
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a2e;">Your card sold</h2>
        <p style="color: #4a4a6a; font-size: 14px;">
          Hi ${sellerName ?? 'there'}, your ${brand} gift card worth $${faceValue.toFixed(2)} has been purchased for $${salePrice.toFixed(2)}.
        </p>
        <p style="color: #4a4a6a; font-size: 14px;">
          Log in to Lantana to complete the transaction.
        </p>
      </div>
    `
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
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a2e;">New Support Message</h2>
        <div style="background: #f8f7f4; border: 1px solid #e2e0db; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a2e;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a2e;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a2e;"><strong>Subject:</strong> ${subject}</p>
          ${reportedUser ? `<p style="margin: 0 0 8px; font-size: 14px; color: #e53e3e;"><strong>Reported User:</strong> @${reportedUser}</p>` : ''}
          <p style="margin: 0; font-size: 14px; color: #1a1a2e;"><strong>Message:</strong><br/>${message}</p>
        </div>
      </div>
    `
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
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 600; color: #1a1a2e;">Your card is ready</h2>
        <p style="color: #4a4a6a; font-size: 14px;">
          Hi ${buyerName}, your ${brand} gift card worth $${faceValue.toFixed(2)} is ready to use.
        </p>
        <div style="background: #f8f7f4; border: 1px solid #e2e0db; padding: 24px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-size: 14px; color: #1a1a2e;">
            <strong>Card Number:</strong> ${cardNumber}
          </p>
          <p style="margin: 0; font-size: 14px; color: #1a1a2e;">
            <strong>PIN:</strong> ${pin}
          </p>
        </div>
        <p style="color: #7a7a9a; font-size: 12px;">
          Keep this email safe. These details will not be shown again on Lantana.
        </p>
      </div>
    `
  })
}