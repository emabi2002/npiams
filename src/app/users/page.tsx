// Redirect to enhanced user management page
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to enhanced page immediately
    router.replace('/users/enhanced')
  }, [router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Redirecting to Enhanced User Management...</p>
        </div>
      </div>
    </div>
  )
}
