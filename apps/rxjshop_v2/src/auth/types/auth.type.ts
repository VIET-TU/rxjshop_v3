import { UserEntity } from '../../user/entities/user.entity'

export type LoginResponseType = Readonly<{
	accessToken: string
	user: UserEntity
}>
export type MeType = LoginResponseType

export type ConfirmEmailReponse = {
	email: string
	otp: any
}
