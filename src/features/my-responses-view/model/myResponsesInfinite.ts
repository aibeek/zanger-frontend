'use client'

import useSWRInfinite from 'swr/infinite'
import Cookies from 'js-cookie'
import { lawyerApi } from '@/shared/api'
import { PAGE_SIZE } from '@/shared/lib'

const fetcher = async (key: string) => {
    try {
        const role = Cookies.get('role')
        console.log('User role:', role)
        
        if (role !== 'lawyer') {
            console.log('User is not a lawyer, returning empty array')
            return []
        }
        
        const urlParams = new URLSearchParams(key.split('?')[1])
        const page = Number(urlParams.get('page')) || 1
        
        console.log('Fetching responses for page:', page)
        const response = await lawyerApi.getResponses({
            page,
            per_page: PAGE_SIZE,
        })
        
        console.log('Responses API response:', response)
        
        // Исправляем типизацию - приводим к any для безопасного доступа к свойствам
        const responseData = response as any
        
        // Обработка различных структур ответа
        if (responseData && typeof responseData === 'object') {
            const data = responseData.data || responseData
            if (Array.isArray(data)) {
                console.log('Found responses:', data.length)
                return data
            } else if (data && Array.isArray(data.data)) {
                console.log('Found responses in nested data:', data.data.length)
                return data.data
            }
        }
        
        console.log('No valid responses found, returning empty array')
        return []
    } catch (error) {
        console.error('Error fetching responses:', error)
        return []
    }
}

export const useMyResponsesInfinite = () => {
    const getKey = (pageIndex: number, previousPageData: any) => {
        if (pageIndex === 0) return '/lawyers/responses?page=1'
        if (previousPageData && previousPageData.length < PAGE_SIZE) return null
        return `/lawyers/responses?page=${pageIndex + 1}`
    }

    const { data, size, setSize, error, mutate } = useSWRInfinite(getKey, fetcher)

    const items = data ? data.flat() : []
    const isLoadingInitialData = !data && !error
    const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined')
    const isReachingEnd = data && data[data.length - 1]?.length < PAGE_SIZE

    return { items, error, isLoadingMore, setSize, size, isReachingEnd, mutate }
}