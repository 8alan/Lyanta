import otherCard from '../assets/cards/other.png'

const brandImages: Record<string, string> = {
  'Abercrombie': new URL('../assets/cards/abercrombie.jpeg', import.meta.url).href,
  'Amazon': new URL('../assets/cards/amazon.png', import.meta.url).href,
  'Banana Republic': new URL('../assets/cards/banana republic.jpeg', import.meta.url).href,
  'Best Buy': new URL('../assets/cards/bestbuy.jpg', import.meta.url).href,
  'Blizzard': new URL('../assets/cards/blizzard.webp', import.meta.url).href,
  'Chipotle': new URL('../assets/cards/chipotle.jpeg', import.meta.url).href,
  'DoorDash': new URL('../assets/cards/doordash.jpeg', import.meta.url).href,
  'GameStop': new URL('../assets/cards/gamestop.jpeg', import.meta.url).href,
  'Google Play': new URL('../assets/cards/google play.jpeg', import.meta.url).href,
  'H&M': new URL('../assets/cards/hm.jpeg', import.meta.url).href,
  'IKEA': new URL('../assets/cards/ikea.jpeg', import.meta.url).href,
  'Instacart': new URL('../assets/cards/instacart.jpeg', import.meta.url).href,
  'Kohls': new URL('../assets/cards/kohls.jpeg', import.meta.url).href,
  'Lego': new URL('../assets/cards/lego.jpeg', import.meta.url).href,
  'Lowes': new URL('../assets/cards/lowes.jpeg', import.meta.url).href,
  'Lululemon': new URL('../assets/cards/lululemon.jpeg', import.meta.url).href,
  'Macys': new URL('../assets/cards/macys.jpeg', import.meta.url).href,
  'Mastercard': new URL('../assets/cards/mastercard.jpeg', import.meta.url).href,
  'Nautica': new URL('../assets/cards/nautica.jpeg', import.meta.url).href,
  'Pink': new URL('../assets/cards/pink.jpeg', import.meta.url).href,
  'Roblox': new URL('../assets/cards/roblox.jpeg', import.meta.url).href,
  'Sephora': new URL('../assets/cards/sephora.jpeg', import.meta.url).href,
  'Staples': new URL('../assets/cards/staples.jpeg', import.meta.url).href,
  'Starbucks': new URL('../assets/cards/starbucks.jpeg', import.meta.url).href,
  'Steam': new URL('../assets/cards/steam.png', import.meta.url).href,
  'Taco Bell': new URL('../assets/cards/tacobell.jpeg', import.meta.url).href,
  'Tinder': new URL('../assets/cards/tinder.jpeg', import.meta.url).href,
  'Uber': new URL('../assets/cards/uber.jpeg', import.meta.url).href,
  'Valorant': new URL('../assets/cards/valorant.jpeg', import.meta.url).href,
  'Other': otherCard
}

export function getBrandImage(brand: string): string {
  return brandImages[brand] ?? otherCard
}

export const SUPPORTED_BRANDS = [
  ...Object.keys(brandImages).filter(b => b !== 'Other').sort(),
  'Other'
]