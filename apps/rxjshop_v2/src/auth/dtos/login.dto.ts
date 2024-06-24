import { IsNotEmpty, IsString } from 'class-validator'
import { ConfirmEmailDto } from './AuthConfirmEmailDto '

export class loginDto extends ConfirmEmailDto {
	@IsString()
	@IsNotEmpty()
	password: string
}
