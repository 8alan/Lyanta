import CryptoJS from 'crypto-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const SECRET_KEY = process.env.ENCRYPTION_KEY!

if (!SECRET_KEY) {
  throw new Error('ENCRYPTION_KEY is not set')
}

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY)
  return bytes.toString(CryptoJS.enc.Utf8)
}