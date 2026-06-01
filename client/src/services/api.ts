import { useAuth } from '@clerk/react'

const BASE_URL = 'http://localhost:5000'

export function useApi() {
  const { getToken } = useAuth()

  const request = async (method: string, path: string, body?: object) => {
    const token = await getToken()
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    const text = await res.text()
    console.log('RAW RESPONSE:', text)
    const data = JSON.parse(text)
    if (!res.ok) throw new Error(data.error || 'Request failed')
    return data
  }
  
  
  return {
    submitGiftCard: (payload: {
      brand: string
      cardNumber: string
      pin: string
      declaredValue: number
    }) => request('POST', '/api/giftcards/submit', payload),

    getMyCards: () => request('GET', '/api/giftcards/mine'),

    getAvailableCards: (brand?: string) =>
      request('GET', `/api/giftcards/available${brand ? `?brand=${brand}` : ''}`),

    getBalance: () => request('GET', '/api/giftcards/balance'),

    createPaymentIntent: (amount: number) =>
      request('POST', '/api/stripe/create-payment-intent', { amount }),

    createListing: (payload: {
      giftCardId: string
      listingType: 'SELL' | 'EXCHANGE' | 'BOTH'
      askingPrice: number
      preferredBrand?: string
      maxExchangeValue?: number
    }) => request('POST', '/api/listings/create', payload),

    getActiveListings: (brand?: string, type?: string) =>
      request('GET', `/api/listings/active${brand ? `?brand=${brand}` : ''}${type ? `${brand ? '&' : '?'}type=${type}` : ''}`),

    getMarketRate: (brand: string) =>
      request('GET', `/api/listings/market-rate/${brand}`),

    getMyListings: () => request('GET', '/api/listings/mine'),

    purchaseListing: (id: string) =>
      request('POST', `/api/listings/${id}/purchase`, {}),

    getListingById: (id: string) =>
      request('GET', `/api/listings/${id}`),

    getAdminOverview: () => request('GET', '/api/admin/overview'),
    getAdminPendingCards: () => request('GET', '/api/admin/gift-cards/pending'),
    adminVerifyCard: (id: string, verifiedBalance?: number) =>
      request('POST', `/api/admin/gift-cards/${id}/verify`, { verifiedBalance }),
    adminRejectCard: (id: string) =>
      request('POST', `/api/admin/gift-cards/${id}/reject`, {}),
  }
      
}