// file to get data about the user profile, and then style

"use client"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

interface SpotifyProfile {
  display_name: string
  images: { url: string }[]
  followers: { total: number }
  country: string
  product: string
}

interface SpotifySession {
  token: {
    access_token: string
  }
}

export default function UserProfile() {
  const { data: session, status } = useSession() as { data: SpotifySession | null, status: string }
  const [profile, setProfile] = useState<SpotifyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.token?.access_token) return

      try {
        setLoading(true)
        setError(null)

        // Fetch user profile
        const profileResponse = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${session.token.access_token}`,
          },
        })

        if (!profileResponse.ok) {
          throw new Error(`Profile fetch failed: ${profileResponse.status}`)
        }

        const profileData = await profileResponse.json()
        setProfile(profileData)
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchProfile()
    }
  }, [session, status])

  if (status === "loading" || loading) {
    return <div className="text-white">Loading profile...</div>
  }

  if (status === "unauthenticated") {
    return <div className="text-white">Please sign in to view your profile</div>
  }

  if (error) {
    return <div className="text-white">Error: {error}</div>
  }

  if (!profile) {
    return <div className="text-white">No profile data available</div>
  }

  // Format account type for display
  const formatAccountType = (type: string | undefined | null) => {
    if (!type) return "Unknown"
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center space-x-4">
        {profile.images?.[0]?.url && (
          <img
            src={profile.images[0].url}
            alt="Profile"
            className="w-24 h-24 rounded-full"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold text-white">{profile.display_name}</h2>
          <p className="text-gray-300">Followers: {profile.followers?.total || 0}</p>
          <p className="text-gray-300">Country: {profile.country || "Unknown"}</p>
          <p className="text-gray-300">Account Type: {formatAccountType(profile.product)}</p>
        </div>
      </div>
    </div>
  )
} 