'use client'

import useSWRInfinite from 'swr/infinite'
import Cookies from 'js-cookie'
import { lawyerApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'

const fetcher = async (key: string) => {
    try {
        const role = Cookies.get('role')
        
        if (role !== 'lawyer') {
            return []
        }
        
        const urlParams = new URLSearchParams(key.split('?')[1])
        const page = Number(urlParams.get('page')) || 1
        
        const response = await lawyerApi.getArchivedResponses({
            page,
            per_page: PAGE_SIZE,
        })
        
        const responseData = response as any
        
        if (responseData && typeof responseData === 'object') {
            const data = responseData.data || responseData
            if (Array.isArray(data)) {
                return data
            } else if (data && Array.isArray(data.data)) {
                return data.data
            }
        }
        
        return []
    } catch (error) {
        console.error('Error fetching archived responses:', error)
        return []
    }
}

export const useArchivedResponsesInfinite = () => {
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (pageIndex === 0) return '/lawyers/responses/archived?page=1'
        if (previousPageData && previousPageData.length < PAGE_SIZE) return null
        return `/lawyers/responses/archived?page=${pageIndex + 1}`
    }

    const { data, size, setSize, error, mutate } = useSWRInfinite(getKey, fetcher)

    const items = data ? data.flat() : []
    const isLoadingInitialData = !data && !error
    const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
    const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

    return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
}
