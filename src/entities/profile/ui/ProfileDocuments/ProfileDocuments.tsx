'use client'

import React, { useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Upload, Select } from 'antd'
import { UploadFile } from 'antd/lib/upload/interface'
import { Button, Modal, useModal } from '@/shared/ui-kit'
import medalIcon from '@/app/assets/icons/medal.svg'
import A4 from '@/app/assets/icons/a4.svg'
import s from './ProfileDocuments.module.scss'
import { ProfileTabWrapper } from '../ProfileTabWrapper'
import Image from 'next/image'
import { useDocuments, useLawyerDocumentsStore } from '../../model'
import toast from 'react-hot-toast'
import { DocumentsList } from './DocumentsList'
import { useLoginStore } from '@/features/auth'
import { useSearchParams } from 'next/navigation'

const { Dragger } = Upload
const { Option } = Select

export const ProfileDocuments = () => {
	const t = useTranslations()

	const FRONT_SIDE_OPTIONS = [
		{ value: 0, label: t('profile.documents.frontSide') },
		{ value: 1, label: t('profile.documents.backSide') },
	]

	const {
		selectedFiles,
		selectedDocumentId,
		setSelectedDocument,
		frontSide,
		addSelectedFile,
		removeSelectedFile,
		isDoubleSided,
		setFrontSide,
		uploadFiles,
	} = useLawyerDocumentsStore()

	const { mutate, documents } = useDocuments()
	const { open, close, isOpen } = useModal()
	const personalData = useLoginStore((state) => state.personalData)
	const fetchPersonalData = useLoginStore((state) => state.getPersonalDataByToken)

	const needDocs = personalData.lawyer?.need_to_access.find((item) => item.type === 'documents')?.need ?? []
	const searchParams = useSearchParams()
	const tab = searchParams.get('tab')
	const shouldOpen = useMemo(() => tab === 'documents', [tab])
	const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']

	const handleBeforeUpload = (file: File) => {
		if (!allowedTypes.includes(file.type)) {
			toast.error('Неподдерживаемый формат файла')
			return
		}

		if (!selectedDocumentId) {
			toast.error('Сначала выберите тип документа')
			return Upload.LIST_IGNORE
		}

		if (isDoubleSided && frontSide === null) {
			toast.error('Выберите сторону документа')
			return Upload.LIST_IGNORE
		}

		addSelectedFile(file)
		return false
	}

	const handleRemoveFile = (file: UploadFile) => {
		removeSelectedFile(file.name)
	}

	const handleUpload = async (mutate) => {
		await uploadFiles(mutate)
		await fetchPersonalData()
		setSelectedDocument(null, false)
		close()
	}

	const handleSelectDocument = (id: number) => {
		const doc = documents.find((d) => d.id === id)
		const isDoubleSided = doc?.is_double_sided ?? false
		setSelectedDocument(id, isDoubleSided)
	}

	const uploadFileList: UploadFile[] = selectedFiles.map((file, idx) => ({
		uid: String(idx),
		name: file.name,
		status: 'done',
	}))

	const needDocsList = Array.isArray(needDocs)
		? needDocs
				.filter((doc) => {
					if (doc.sides && Array.isArray(doc.sides)) {
						return doc.sides.some((side) => side.link === null)
					}
					return doc.link === null
				})
				.map((doc) => ({
					id: doc.id,
					name: doc.name,
				}))
		: []

	useEffect(() => {
		if (shouldOpen) {
			const timeout = setTimeout(() => {
				const el = document.getElementById('documents-section')
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'start' })
				}
			}, 300)

			return () => clearTimeout(timeout)
		}
	}, [shouldOpen])

	return (
		<>
			<ProfileTabWrapper
				defaultOpen={shouldOpen}
				title={t('profile.documents.title')}
				imgSrc={medalIcon}
				imgAlt="personalData"
				panel_title={t('profile.documents.panelTitle')}
				panel_descr={t('profile.documents.panelDescription')}>
				<div id="documents-section">
					{needDocsList.length > 0 && (
						<Button
							className={s.openModalBtn}
							variant="primary"
							size="md"
							onClick={open}>
							{t('profile.documents.uploadBtn')}
						</Button>
					)}

					{documents.filter((doc) => doc.link).length > 0 ? (
						<DocumentsList
							mutate={mutate}
							documents={documents}
						/>
					) : (
						<p className={s.noDocuments}>{t('profile.documents.noDocs')}</p>
					)}
				</div>
			</ProfileTabWrapper>
			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}
				closeButton
				title={t('profile.documents.modalTitle')}>
				<div className={s.upload}>
					<div className={s.top}>
						{/* тянуть с другого места и сделать проверку для удоса */}
						<Select
							value={selectedDocumentId ?? undefined}
							onChange={handleSelectDocument}
							style={{ width: 250, marginBottom: 16 }}
							placeholder={t('profile.documents.selectDocType')}>
							{needDocsList.map((type) => (
								<Option
									key={type.id}
									value={type.id}>
									{type.name}
								</Option>
							))}
						</Select>

						{isDoubleSided && (
							<Select
								value={frontSide ?? undefined}
								onChange={setFrontSide}
								style={{ width: 250, marginBottom: 16 }}
								placeholder={t('profile.documents.selectSide')}>
								{FRONT_SIDE_OPTIONS.map((option) => (
									<Option
										key={option.value}
										value={option.value}>
										{option.label}
									</Option>
								))}
							</Select>
						)}
					</div>

					<Dragger
						beforeUpload={handleBeforeUpload}
						multiple={false}
						disabled={!selectedDocumentId || (selectedDocumentId === 1 && frontSide === null)}
						showUploadList={false}
						className={s.dragger}>
						<div className={s.topDragger}>
							<p className={s.icon}>
								<Image
									src={A4}
									alt="иконка"
									width={50}
									height={60}
								/>
							</p>
							<p className={s.text}>{t('profile.documents.dragText')}</p>
						</div>
					</Dragger>

					{selectedFiles.length > 0 && (
						<Upload
							fileList={uploadFileList}
							showUploadList={{ showRemoveIcon: true }}
							onRemove={handleRemoveFile}
						/>
					)}

					<Button
						className={s.uploadButton}
						variant="primary"
						size="md"
						style={{ marginTop: 20 }}
						disabled={selectedFiles.length === 0 || frontSide === null || !selectedDocumentId}
						onClick={() => handleUpload(mutate)}>
						{t('profile.documents.uploadBtn')}
					</Button>
				</div>
			</Modal>
		</>
	)
}
