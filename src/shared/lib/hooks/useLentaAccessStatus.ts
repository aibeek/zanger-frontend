import { useLoginStore } from '@/features/auth'

export const useLentaAccessStatus = () => {
	const personalData = useLoginStore((store) => store.personalData)
	const accessItems = personalData.lawyer?.need_to_access

	const result = {
		hasAccess: true,
		needsDocuments: false,
		needsSubscription: false,
		hasModerationDocs: false,
	}

	if (!personalData?.lawyer || !Array.isArray(accessItems)) {
		return result
	}

	for (const item of accessItems) {
		if (item.type === 'documents') {
			const docs = item.need

			if (Array.isArray(docs)) {
				const hasMissingDocs = docs.some((doc) => !doc.is_uploaded)

				if (hasMissingDocs) {
					result.needsDocuments = true
					result.hasAccess = false
				} else {
					// @ts-expect-error fix it
					const allOnModeration = docs.every((doc) => doc.status?.type === 'moderation')
					if (allOnModeration) {
						result.hasModerationDocs = true
						result.hasAccess = false
					}
				}
			}
		}

		if (item.type === 'subscription' && item.need === true) {
			result.needsSubscription = true
			result.hasAccess = false
		}
	}

	return result
}
