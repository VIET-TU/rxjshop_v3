import { IsNotEmpty, IsString } from 'class-validator'

export class ChangePasswordDto {
	@IsNotEmpty()
	@IsString()
	userId: string

	@IsString()
	token: string

	@IsString()
	password: string
}
