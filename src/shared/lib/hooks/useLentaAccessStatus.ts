import { getUploadStatus } from '@/entities/profile/ui/ProfileDocuments/getUploadStatus'
import { useLoginStore } from '@/features/auth'

export const useLentaAccessStatus = () => {
	const personalData = useLoginStore((store) => store.personalData)
	const accessItems = personalData.lawyer?.need_to_access

	const result = {
		hasAccess: true,
		needsDocuments: false,
		needsSubscription: false,
		hasModerationDocs: false,
		documentStatuses: [] as {
			id: number
			name: string
			status: 'not_uploaded' | 'partially_uploaded' | 'fully_uploaded'
			moderation: boolean
		}[],
	}

	if (!personalData?.lawyer || !Array.isArray(accessItems)) {
		return result
	}

	for (const item of accessItems) {
		if (item.type === 'documents') {
			const docs = item.need

			if (Array.isArray(docs)) {
				let hasMissingDocs = false
				let someOnModeration = false

				for (const doc of docs) {
					// @ts-expect-error fix it
					const status = getUploadStatus(doc)

					if (status !== 'fully_uploaded') {
						hasMissingDocs = true
					}

					// Модерация: либо общий статус, либо у сторон
					const moderation =
						// @ts-expect-error fix it
						doc.status?.type === 'moderation' ||
						// @ts-expect-error fix it
						doc.sides?.some((side) => side.status?.type === 'moderation') ||
						false

					if (moderation) {
						someOnModeration = true
					}

					result.documentStatuses.push({
						id: doc.id,
						name: doc.name,
						status,
						moderation,
					})
				}

				if (hasMissingDocs) {
					result.needsDocuments = true
					result.hasAccess = false
				} else if (someOnModeration) {
					result.hasModerationDocs = true
					result.hasAccess = false
				}
			}
		}

		if (item.type === 'subscription' && item.need === true) {
			result.needsSubscription = true
			// возможно, тоже стоит заблокировать:
			// result.hasAccess = false
		}
	}

	return result
}
