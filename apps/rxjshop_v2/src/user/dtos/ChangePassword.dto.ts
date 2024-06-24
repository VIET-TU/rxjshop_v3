import { IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator'

export class ChangePassWordDto {
	@IsString()
	currentPasswd: string
	@IsString()
	newPasswd: string
}
