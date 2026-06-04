import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import Dashboard from './pages/dashboard.tsx'
import Landing from './pages/landing.tsx'
import SubmitCard from './pages/SubmitCard.tsx'
import BrowseCards from './pages/BrowseCards.tsx'
import CashOut from './pages/CashOut.tsx'
import BuyCredits from './pages/BuyCredits.tsx'
import CreateListing from './pages/CreateListing.tsx'
import ListingDetail from './pages/ListingDetail.tsx'
import Admin from './pages/Admin.tsx'
import MyListings from './pages/MyListings.tsx'
import EditListing from './pages/EditListing.tsx'
import MyTrades from './pages/MyTrades.tsx'

function App() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  return (
    <Routes>
      <Route path="/" element={isSignedIn ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/dashboard" element={isSignedIn ? <Dashboard /> : <Navigate to="/" />} />
      <Route path="/submit" element={isSignedIn ? <SubmitCard /> : <Navigate to="/" />} />
      <Route path="/browse" element={<BrowseCards />} />
      <Route path="/cashout" element={isSignedIn ? <CashOut /> : <Navigate to="/" />} />
      <Route path="/buy-credits" element={isSignedIn ? <BuyCredits /> : <Navigate to="/" />} />
      <Route path="/create-listing" element={isSignedIn ? <CreateListing /> : <Navigate to="/" />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/admin" element={isSignedIn ? <Admin /> : <Navigate to="/" />} />
      <Route path="/my-listings" element={isSignedIn ? <MyListings /> : <Navigate to="/" />} />
      <Route path="/edit-listing/:id" element={isSignedIn ? <EditListing /> : <Navigate to="/" />} />
      <Route path="/my-trades" element={isSignedIn ? <MyTrades /> : <Navigate to="/" />} />
    </Routes>
  )
}

export default App