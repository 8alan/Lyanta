import { useAuth } from '@clerk/react'

const BASE_URL = 'https://api.lyanta.com'

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

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status >= 500) {
          throw new Error('Something went wrong on our end. Please try again.')
        }
        if (res.status === 404) {
          throw new Error('The requested resource could not be found.')
        }
        if (res.status === 403) {
          throw new Error("You don't have permission to do that.")
        }
        if (res.status === 401) {
          throw new Error('Please sign in to continue.')
        }
        throw new Error(data.error || 'Something went wrong. Please try again.')
      }

      return data
    } catch (err) {
        if (err instanceof Error && err.message === 'Failed to fetch') {
          throw new Error('Unable to connect. Please check your internet connection and try again.', { cause: err })
        }
        throw err
      }
  }

  return {
    submitGiftCard: (payload: {
      brand: string
      cardNumber: string
      pin: string
      declaredValue: number
      description?: string
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

    confirmGiftCard: (id: string) =>
      request('PATCH', `/api/giftcards/${id}/confirm`, {}),

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

    adminRejectCard: (id: string, reason?: string) =>
      request('POST', `/api/admin/gift-cards/${id}/reject`, { reason }),

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

    getMyProfile: () => request('GET', '/api/profile/me'),

    updateUsername: (username: string) =>
      request('PATCH', '/api/profile/username', { username }),

    getPublicProfile: (username: string) =>
      request('GET', `/api/profile/${username}`, undefined, false),

    updateBio: (bio: string) =>
      request('PATCH', '/api/profile/bio', { bio }),

    uploadAvatar: (file: File) => {
      const formData = new FormData()
      formData.append('avatar', file)
      return getToken().then(token =>
        fetch(`${BASE_URL}/api/profile/avatar`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData
        }).then(res => res.json())
      )
    },

    submitReview: (tradeId: string, payload: { rating: number; comment?: string }) =>
      request('POST', `/api/trades/${tradeId}/review`, payload),

    contactSupport: async (data: {
      name: string
      email: string
      subject: string
      message: string
      reportedUser?: string
    }) => {
      const res = await fetch(`${BASE_URL}/api/support/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },

    getMyEarnings: async () => {
      const res = await fetch(`${BASE_URL}/api/listings/my/earnings`, {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },

    getTopCards: async () => {
      const res = await fetch(`${BASE_URL}/api/listings/my/top-cards`)
      if (!res.ok) throw new Error((await res.json()).error)
      return res.json()
    },

    verifyIdentity: () => request('POST', '/api/stripe/verify-identity', {}),

    
  }
}