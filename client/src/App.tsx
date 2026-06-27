import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import { useApi } from './services/api.ts'
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
import Profile from './pages/Profile.tsx'
import PublicProfile from './pages/PublicProfile.tsx'
import Help from './pages/Help.tsx'
import PendingListings from './pages/PendingListings.tsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'
import SetupUsername from './pages/SetupUsername.tsx'

function App() {
  const { isSignedIn, isLoaded } = useAuth()
  const api = useApi()
  const [hasUsername, setHasUsername] = useState<boolean | null>(null)

  useEffect(() => {
    if (isSignedIn) {
      api.getMyProfile()
        .then(data => setHasUsername(!!data.profile.username))
        .catch(() => setHasUsername(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn])

  if (!isLoaded) return null
  if (isSignedIn && hasUsername === null) return null

  const needsUsername = isSignedIn && !hasUsername

  return (
    <Routes>
      <Route path="/" element={isSignedIn ? <Navigate to="/dashboard" /> : <Landing />} />
      <Route path="/setup-username" element={isSignedIn ? <SetupUsername /> : <Navigate to="/" />} />
      <Route path="/dashboard" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <Dashboard />) : <Navigate to="/" />} />
      <Route path="/submit" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <SubmitCard />) : <Navigate to="/" />} />
      <Route path="/browse" element={<BrowseCards />} />
      <Route path="/cashout" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <CashOut />) : <Navigate to="/" />} />
      <Route path="/buy-credits" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <BuyCredits />) : <Navigate to="/" />} />
      <Route path="/create-listing" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <CreateListing />) : <Navigate to="/" />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/admin" element={isSignedIn ? <Admin /> : <Navigate to="/" />} />
      <Route path="/my-listings" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <MyListings />) : <Navigate to="/" />} />
      <Route path="/edit-listing/:id" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <EditListing />) : <Navigate to="/" />} />
      <Route path="/my-trades" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <MyTrades />) : <Navigate to="/" />} />
      <Route path="/profile" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <Profile />) : <Navigate to="/" />} />
      <Route path="/profile/:username" element={<PublicProfile />} />
      <Route path="/help" element={<Help />} />
      <Route path="/pending-listings" element={isSignedIn ? (needsUsername ? <Navigate to="/setup-username" /> : <PendingListings />) : <Navigate to="/" />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    </Routes>
  )
}

export default App