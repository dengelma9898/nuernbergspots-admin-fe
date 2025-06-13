import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { useDashboardData } from '../useDashboardData'

// Mock the services
const mockUserService = {
  getBusinessUsersInReviewCount: vi.fn(),
}

const mockBusinessService = {
  getPendingApprovalsCount: vi.fn(),
}

const mockContactService = {
  getOpenContactRequestsCount: vi.fn(),
}

vi.mock('@/services/userService', () => ({
  useUserService: () => mockUserService,
}))

vi.mock('@/services/businessService', () => ({
  useBusinessService: () => mockBusinessService,
}))

vi.mock('@/services/contactService', () => ({
  useContactService: () => mockContactService,
}))

describe('useDashboardData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUserService.getBusinessUsersInReviewCount.mockResolvedValue(0)
    mockBusinessService.getPendingApprovalsCount.mockResolvedValue(0)
    mockContactService.getOpenContactRequestsCount.mockResolvedValue(0)
  })

  it('should initialize with default values and loading state', () => {
    const { result } = renderHook(() => useDashboardData())

    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBe(null)
    expect(result.current.data).toEqual({
      pendingApprovals: 0,
      usersInReview: 0,
      openContactRequests: 0,
    })
  })

  it('should fetch and set data successfully', async () => {
    mockUserService.getBusinessUsersInReviewCount.mockResolvedValue(5)
    mockBusinessService.getPendingApprovalsCount.mockResolvedValue(3)
    mockContactService.getOpenContactRequestsCount.mockResolvedValue(2)

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual({
      pendingApprovals: 3,
      usersInReview: 5,
      openContactRequests: 2,
    })
    expect(result.current.error).toBe(null)
  })

  it('should handle errors correctly', async () => {
    const errorMessage = 'Failed to fetch data'
    mockUserService.getBusinessUsersInReviewCount.mockRejectedValue(new Error(errorMessage))

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe(errorMessage)
  })

  it('should handle non-Error objects', async () => {
    mockBusinessService.getPendingApprovalsCount.mockRejectedValue('String error')

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Ein unbekannter Fehler ist aufgetreten')
  })

  it('should call all service methods', async () => {
    renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(mockUserService.getBusinessUsersInReviewCount).toHaveBeenCalledTimes(1)
      expect(mockBusinessService.getPendingApprovalsCount).toHaveBeenCalledTimes(1)
      expect(mockContactService.getOpenContactRequestsCount).toHaveBeenCalledTimes(1)
    })
  })

  it('should refetch data when refetch is called', async () => {
    // Initial setup
    mockUserService.getBusinessUsersInReviewCount.mockResolvedValue(10)
    mockBusinessService.getPendingApprovalsCount.mockResolvedValue(7)
    mockContactService.getOpenContactRequestsCount.mockResolvedValue(4)

    const { result } = renderHook(() => useDashboardData())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual({
      pendingApprovals: 7,
      usersInReview: 10,
      openContactRequests: 4,
    })

    // Reset mocks and set new values
    mockUserService.getBusinessUsersInReviewCount.mockClear()
    mockBusinessService.getPendingApprovalsCount.mockClear()
    mockContactService.getOpenContactRequestsCount.mockClear()
    
    mockUserService.getBusinessUsersInReviewCount.mockResolvedValue(15)
    mockBusinessService.getPendingApprovalsCount.mockResolvedValue(12)
    mockContactService.getOpenContactRequestsCount.mockResolvedValue(8)

    // Call refetch
    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.data).toEqual({
        pendingApprovals: 12,
        usersInReview: 15,
        openContactRequests: 8,
      })
    })

    // Verify services were called for refetch
    expect(mockUserService.getBusinessUsersInReviewCount).toHaveBeenCalledTimes(1)
    expect(mockBusinessService.getPendingApprovalsCount).toHaveBeenCalledTimes(1)
    expect(mockContactService.getOpenContactRequestsCount).toHaveBeenCalledTimes(1)
  })

  it('should handle partial service failures', async () => {
    mockUserService.getBusinessUsersInReviewCount.mockResolvedValue(5)
    mockBusinessService.getPendingApprovalsCount.mockRejectedValue(new Error('Service down'))
    mockContactService.getOpenContactRequestsCount.mockResolvedValue(3)

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Service down')
    // Data should still be at initial values since the Promise.all failed
    expect(result.current.data).toEqual({
      pendingApprovals: 0,
      usersInReview: 0,
      openContactRequests: 0,
    })
  })

  it('should reset error state on successful refetch', async () => {
    // First call fails
    mockUserService.getBusinessUsersInReviewCount.mockRejectedValue(new Error('Initial error'))

    const { result } = renderHook(() => useDashboardData())

    await waitFor(() => {
      expect(result.current.error).toBe('Initial error')
    })

    // Mock successful calls for refetch
    mockUserService.getBusinessUsersInReviewCount.mockResolvedValue(5)
    mockBusinessService.getPendingApprovalsCount.mockResolvedValue(3)
    mockContactService.getOpenContactRequestsCount.mockResolvedValue(2)

    await result.current.refetch()

    await waitFor(() => {
      expect(result.current.error).toBe(null)
    })
    
    expect(result.current.data).toEqual({
      pendingApprovals: 3,
      usersInReview: 5,
      openContactRequests: 2,
    })
  })

  it('should set loading to true during refetch', async () => {
    const { result } = renderHook(() => useDashboardData())

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Mock a slower response for refetch that we can control timing
    let resolveUserService: (value: number) => void
    let resolveBusinessService: (value: number) => void  
    let resolveContactService: (value: number) => void

    const slowUserPromise = new Promise<number>((resolve) => {
      resolveUserService = resolve
    })
    const slowBusinessPromise = new Promise<number>((resolve) => {
      resolveBusinessService = resolve
    })
    const slowContactPromise = new Promise<number>((resolve) => {
      resolveContactService = resolve
    })

    mockUserService.getBusinessUsersInReviewCount.mockReturnValue(slowUserPromise)
    mockBusinessService.getPendingApprovalsCount.mockReturnValue(slowBusinessPromise)
    mockContactService.getOpenContactRequestsCount.mockReturnValue(slowContactPromise)

    // Start refetch (don't await yet)
    const refetchPromise = result.current.refetch()

    // Wait a bit and check that loading is true during refetch
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    })

    // Resolve all promises
    resolveUserService!(10)
    resolveBusinessService!(8)
    resolveContactService!(5)
    await refetchPromise

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
}) 