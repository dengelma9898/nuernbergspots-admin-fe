import { useState, useEffect, useCallback, useRef } from 'react'

import { useUserService } from '@/services/userService'
import { useBusinessService } from '@/services/businessService'
import { useContactService } from '@/services/contactService'

export interface DashboardData {
  pendingApprovals: number
  usersInReview: number
  openContactRequests: number
}

export interface UseDashboardDataReturn {
  data: DashboardData
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData>({
    pendingApprovals: 0,
    usersInReview: 0,
    openContactRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const userService = useUserService()
  const businessService = useBusinessService()
  const contactService = useContactService()
  const isInitialMount = useRef(true)

  const fetchPendingApprovals = useCallback(async (): Promise<number> => {
    try {
      return await businessService.getPendingApprovalsCount()
    } catch (error) {
      console.error('Fehler beim Laden der ausstehenden Genehmigungen:', error)
      throw error
    }
  }, [businessService])

  const fetchUsersInReview = useCallback(async (): Promise<number> => {
    try {
      return await userService.getBusinessUsersInReviewCount()
    } catch (error) {
      console.error('Fehler beim Laden der zu überprüfenden Benutzer:', error)
      throw error
    }
  }, [userService])

  const fetchOpenContactRequests = useCallback(async (): Promise<number> => {
    try {
      return await contactService.getOpenContactRequestsCount()
    } catch (error) {
      console.error('Fehler beim Laden der offenen Kontaktanfragen:', error)
      throw error
    }
  }, [contactService])

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const [pendingApprovals, usersInReview, openContactRequests] = await Promise.all([
        fetchPendingApprovals(),
        fetchUsersInReview(),
        fetchOpenContactRequests(),
      ])

      setData({
        pendingApprovals,
        usersInReview,
        openContactRequests,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }, [fetchPendingApprovals, fetchUsersInReview, fetchOpenContactRequests])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      fetchAllData()
    }
  }, [fetchAllData])

  return {
    data,
    loading,
    error,
    refetch: fetchAllData,
  }
} 