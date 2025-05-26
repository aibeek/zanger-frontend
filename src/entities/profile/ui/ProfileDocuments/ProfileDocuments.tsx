'use client'

import React, { useEffect } from 'react'
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

const { Dragger } = Upload
const { Option } = Select

const FRONT_SIDE_OPTIONS = [
	{ value: 0, label: 'Передняя часть документа' },
	{ value: 1, label: 'Задняя часть документа' },
]

export const ProfileDocuments = () => {
	const t = useTranslations()
	const {
		selectedFiles,
		selectedDocumentId,
		frontSide,
		addSelectedFile,
		removeSelectedFile,
		setSelectedDocumentId,
		setFrontSide,
		uploadFiles,
	} = useLawyerDocumentsStore()

	const { mutate, documents } = useDocuments()
	const { open, close, isOpen } = useModal()

	const handleBeforeUpload = (file: File) => {
		if (!selectedDocumentId) {
			toast.error('Сначала выберите тип документа')
			return Upload.LIST_IGNORE
		}

		// if (frontSide === null || frontSide === undefined) {
		// 	toast.error('Выберите сторону документа')
		// 	return Upload.LIST_IGNORE
		// }

		const isImage = file.type.startsWith('image/')
		const isPdf = file.type === 'application/pdf'

		if (!isImage && !isPdf) {
			toast.error('Поддерживаемые форматы: jpg, jpeg, png, pdf')
			return Upload.LIST_IGNORE
		}

		addSelectedFile(file)
		return false
	}

	const handleRemoveFile = (file: UploadFile) => {
		removeSelectedFile(file.name)
	}

	const handleUpload = async () => {
		await uploadFiles(mutate)
		close()
	}

	const uploadFileList: UploadFile[] = selectedFiles.map((file, idx) => ({
		uid: String(idx),
		name: file.name,
		status: 'done',
	}))

	const documentTypes = Array.isArray(documents)
		? documents
				.filter((doc) => {
					if (doc.sides && Array.isArray(doc.sides)) {
						// @ts-expect-error fix it
						return doc.sides.some((side) => side.link === null)
					}
					return doc.link === null
				})
				.map((doc) => ({
					id: doc.id,
					name: doc.name,
				}))
		: []

	return (
		<>
			<ProfileTabWrapper
				title={t('profile.documents.title')}
				imgSrc={medalIcon}
				imgAlt="personalData"
				panel_title={t('profile.documents.panelTitle')}
				panel_descr={t('profile.documents.panelDescription')}>
				<Button
					className={s.openModalBtn}
					variant="primary"
					size="md"
					onClick={open}>
					Загрузить документы
				</Button>

				{documents.filter((doc) => doc.link).length > 0 ? (
					<DocumentsList mutate={mutate} />
				) : (
					<p className={s.noDocuments}>Нет загруженных документов</p>
				)}
			</ProfileTabWrapper>

			<Modal
				className={s.modal}
				isOpen={isOpen}
				onClose={close}
				closeButton
				title="Загрузить документ">
				<div className={s.upload}>
					<div className={s.top}>
						<Select
							value={selectedDocumentId ?? undefined}
							onChange={setSelectedDocumentId}
							style={{ width: 250, marginBottom: 16 }}
							placeholder="Выберите тип документа">
							{documentTypes.map((type) => (
								<Option
									key={type.id}
									value={type.id}>
									{type.name}
								</Option>
							))}
						</Select>

						{selectedDocumentId === 1 && (
							<Select
								value={frontSide ?? undefined}
								onChange={setFrontSide}
								style={{ width: 250, marginBottom: 16 }}
								placeholder="Выберите сторону документа">
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
							<p className={s.text}>Перетащите или выберите файл(ы)</p>
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
						disabled={(selectedFiles.length === 0 && frontSide === null) || !selectedDocumentId}
						onClick={handleUpload}>
						Загрузить документы
					</Button>
				</div>
			</Modal>
		</>
	)
}
