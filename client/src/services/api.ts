import { useAuth } from '@clerk/react'

const BASE_URL = 'http://localhost:5000'

export function useApi() {
  const { getToken } = useAuth()

  const request = async (method: string, path: string, body?: object, requiresAuth = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (requiresAuth) {
    const token = await getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await res.json()
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

    editListing: (id: string, payload: {
      buyNowPrice?: number
      minAcceptPrice?: number
      acceptsExchange?: boolean
      preferredBrand?: string[]
      preferredMinValue?: number
    }) => request('PATCH', `/api/listings/${id}`, payload),

    cancelListing: (id: string) =>
      request('POST', `/api/listings/${id}/cancel`, {}),
        createListing: (payload: {
          giftCardId: string
          buyNowPrice?: number
          minAcceptPrice?: number
          acceptsExchange: boolean
          preferredBrand?: string[]
          preferredMinValue?: number
        }) => request('POST', '/api/listings/create', payload),

    deleteGiftCard: (id: string) =>
      request('DELETE', `/api/giftcards/${id}`),

    getActiveListings: (brand?: string, type?: string) =>
      request('GET', `/api/listings/active${brand ? `?brand=${brand}` : ''}${type ? `${brand ? '&' : '?'}type=${type}` : ''}`, undefined, false),

    getMarketRate: (brand: string) =>
      request('GET', `/api/listings/market-rate/${brand}`),

    getMyListings: () => request('GET', '/api/listings/mine'),

    purchaseListing: (id: string) =>
      request('POST', `/api/listings/${id}/purchase`, {}),

    getListingById: (id: string) =>
      request('GET', `/api/listings/${id}`, undefined, false),

    getAdminOverview: () => request('GET', '/api/admin/overview'),

    getAdminPendingCards: () => request('GET', '/api/admin/gift-cards/pending'),

    adminVerifyCard: (id: string, verifiedBalance?: number) =>
      request('POST', `/api/admin/gift-cards/${id}/verify`, { verifiedBalance }),
    
    adminRejectCard: (id: string) =>
      request('POST', `/api/admin/gift-cards/${id}/reject`, {}),

    placeBid: (listingId: string, payload: {
      bidType: 'CASH' | 'EXCHANGE'
      cashAmount?: number
      offeredCardId?: string
    }) => request('POST', `/api/listings/${listingId}/bid`, payload),

    acceptBid: (listingId: string, bidId: string) =>
      request('POST', `/api/listings/${listingId}/bids/${bidId}/accept`, {}),

    rejectBid: (listingId: string, bidId: string) =>
      request('POST', `/api/listings/${listingId}/bids/${bidId}/reject`, {}),

    getCardDetails: (listingId: string) =>
      request('GET', `/api/listings/${listingId}/card-details`),
    
    getMyTrades: () => request('GET', '/api/trades/mine'),

  }
      
}