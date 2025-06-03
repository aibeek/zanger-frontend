import { create } from 'zustand'
import toast from 'react-hot-toast'
import { profileApi, UpdateServicingRegions } from '@/shared/api'
import { Region } from '@/shared/lib/types'

interface ServicingRegionsState {
	isSubmitting: boolean
	success: boolean
	servicingCities: Region[]
	fetchServicingRegions: () => Promise<void>
	updateServicingRegions: (servicingCities: UpdateServicingRegions) => Promise<void>
}

export const useServicingRegions = create<ServicingRegionsState & { isLoaded: boolean; load: () => Promise<void> }>(
	(set, get) => {
		const fetchServicingRegions = async () => {
			set({ isSubmitting: true, success: false })

			try {
				const res = await profileApi.getServicingRegions()
				// @ts-expect-error fix it
				set({ servicingCities: res.data, success: true, isLoaded: true })
			} catch (e: any) {
				console.error(e)
				toast.error('Произошла ошибка')
				set({ isLoaded: false })
			} finally {
				set({ isSubmitting: false })
			}
		}

		const updateServicingRegions = async (regions: UpdateServicingRegions) => {
			set({ isSubmitting: true, success: false })

			try {
				await profileApi.updateServicingRegions(regions)
				set({ success: true })
				toast.success('Обслуживаемая локация успешно обновлена')
				await get().fetchServicingRegions()
			} catch (e: any) {
				console.error(e)
				toast.error('Произошла ошибка')
			} finally {
				set({ isSubmitting: false })
			}
		}

		// ленивый загрузчик
		const load = async () => {
			if (!get().isLoaded) {
				await fetchServicingRegions()
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
