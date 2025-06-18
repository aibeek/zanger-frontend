import { LawyerDocument } from "@/shared/api"

type UploadStatus =
	| 'not_uploaded'
	| 'partially_uploaded'
	| 'fully_uploaded'

export const getUploadStatus = (doc: LawyerDocument): UploadStatus => {
	if (!doc.is_double_sided) {
		return doc.is_uploaded ? 'fully_uploaded' : 'not_uploaded'
	}

  // @ts-expect-error fix it
	if (!Array.isArray(doc.sides) || doc.sides.length === 0) {
		return 'not_uploaded'
	}

  // @ts-expect-error fix it
	const uploadedCount = doc.sides.filter((side) => side.is_uploaded).length

	if (uploadedCount === 0) return 'not_uploaded'
	if (uploadedCount < 2) return 'partially_uploaded'
	return 'fully_uploaded'
}
