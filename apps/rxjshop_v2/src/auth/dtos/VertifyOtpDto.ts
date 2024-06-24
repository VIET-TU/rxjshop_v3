import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'

export class VertifyOtpDto {
	@IsNotEmpty()
	@Expose()
	@IsString()
	email: string

	@Expose()
	@IsString()
	Otp: string
}
