import { IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator'
import { ConfirmEmailDto } from './AuthConfirmEmailDto '
import { Expose, Transform, TransformFnParams } from 'class-transformer'

export class RegisterDto extends ConfirmEmailDto {
	@IsNotEmpty({ message: 'username is not empty' })
	@IsString()
	@Transform(({ value }: TransformFnParams) => value?.trim().replace(/\s+/g, ' '))
	@MinLength(2)
	firstName: string

	@IsNotEmpty({ message: 'username is not empty' })
	@IsString()
	@Transform(({ value }: TransformFnParams) => value?.trim().replace(/\s+/g, ' '))
	@MinLength(2)
	lastName: string

	@IsString()
	@IsNotEmpty({ message: 'password is not empty' })
	@Length(5, 23, { message: 'lenght password is not enough' })
	password: string
}
