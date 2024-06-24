import { IsOptional, IsString, Matches } from 'class-validator'

export class UpdateUserDto {
	@IsOptional()
	fullName?: string

	@IsOptional()
	phone?: string

	@IsOptional()
	address?: string
	@IsOptional()
	avatar?: string
}
