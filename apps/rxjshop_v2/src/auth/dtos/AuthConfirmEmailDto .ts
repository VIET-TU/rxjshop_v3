import { Expose, Transform, TransformFnParams } from 'class-transformer'
import { IsNotEmpty, IsString, Matches } from 'class-validator'

export class ConfirmEmailDto {
	@IsNotEmpty({ message: 'email is not empty' })
	@Expose()
	@IsString()
	@Transform(({ value }: TransformFnParams) => value?.trim().replace(/\s+/g, ' '))
	@Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g, {
		message: 'Invalid email',
	})
	email: string
}
