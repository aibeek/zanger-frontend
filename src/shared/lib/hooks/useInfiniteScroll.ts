'use client'

import { useEffect } from 'react'

export const useInfiniteScroll = ({ loadMore, isLoadingMore, isReachingEnd, loadMoreRef }) => {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !isLoadingMore && !isReachingEnd) {
					loadMore()

					setTimeout(() => {
						window.scrollBy({ top: -300, behavior: 'smooth' })
					}, 3000)
				}
			},
			{
				threshold: 1,
				rootMargin: '100px',
			},
		)

		if (loadMoreRef.current) observer.observe(loadMoreRef.current)

		return () => {
			if (loadMoreRef.current) observer.unobserve(loadMoreRef.current)
		}
	}, [isLoadingMore, isReachingEnd, loadMore, loadMoreRef])
}
