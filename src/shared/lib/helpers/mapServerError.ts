type ErrorMessages = {
	phoneAlreadyTaken: string
	invalidPhoneSelected: string
	phoneExists: string
	phoneMustBe11Digits: string
	invalidSelectedValue: string
	invalidCode: string
	enterCode: string
}

const errorMap: Record<string, keyof ErrorMessages> = {
	'The phone has already been taken.': 'phoneAlreadyTaken',
	'The selected phone is invalid.': 'invalidPhoneSelected',
	'phone уже существует!': 'phoneExists',
	'phone must contain exactly 11 digits.': 'phoneMustBe11Digits',
	'Selected value is invalid.': 'invalidSelectedValue',
	'Invalid code': 'invalidCode',
	'Enter code': 'enterCode',
	'phone должно содержать ровно 11 цифр.': 'phoneMustBe11Digits',
}

export const mapServerError = (message: string): keyof ErrorMessages | null => {
	return errorMap[message] || null
}
