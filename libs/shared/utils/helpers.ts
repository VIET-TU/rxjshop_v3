import * as bcrypt from 'bcrypt'

export async function hashX(rawPassword: string) {
	const salt = await bcrypt.genSalt(10)
	return bcrypt.hash(rawPassword, salt)
}

export async function compareHash(rawPassword: string, hashedPassword: string) {
	return await bcrypt.compare(rawPassword, hashedPassword)
}
