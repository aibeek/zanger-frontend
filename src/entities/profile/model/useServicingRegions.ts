import { create } from 'zustand'
import toast from 'react-hot-toast'
import { profileApi, UpdateServicingRegions } from '@/shared/api'
import { Region } from '@/shared/lib/types'

interface ServicingRegionsState {
	isSubmitting: boolean
	success: boolean
	servicingCities: Region[]
	fetchServicingRegions: (t: (key: string) => string) => Promise<void>
	updateServicingRegions: (servicingCities: UpdateServicingRegions, t: (key: string) => string) => Promise<void>
	load: (t: (key: string) => string) => Promise<void>
}

export const useServicingRegions = create<ServicingRegionsState & { isLoaded: boolean; load: () => Promise<void> }>(
	(set, get) => {
		const fetchServicingRegions = async (t) => {
			set({ isSubmitting: true, success: false })

			try {
				const res = await profileApi.getServicingRegions()
				// @ts-expect-error fix it
				set({ servicingCities: res.data, success: true, isLoaded: true })
			} catch (e: any) {
				console.error(e)
				toast.error(t('profile.servicing_cities.error'))
				set({ isLoaded: false })
			} finally {
				set({ isSubmitting: false })
			}
		}

		const updateServicingRegions = async (regions: UpdateServicingRegions, t) => {
			set({ isSubmitting: true, success: false })

			try {
				await profileApi.updateServicingRegions(regions)
				set({ success: true })
				toast.success(t('profile.servicing_cities.success'))
				await get().fetchServicingRegions(t)
			} catch (e: any) {
				console.error(e)
				toast.error(t('profile.servicing_cities.error'))
			} finally {
				set({ isSubmitting: false })
			}
		}

		const load = async () => {
			if (!get().isLoaded) {
				await fetchServicingRegions(toast)
			}
		}

		return {
			isSubmitting: false,
			success: false,
			servicingCities: [],
			isLoaded: false,
			fetchServicingRegions,
			updateServicingRegions,
			load,
		}
	},
)
