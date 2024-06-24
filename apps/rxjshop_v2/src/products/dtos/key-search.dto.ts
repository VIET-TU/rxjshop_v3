import { IsOptional } from 'class-validator'
import { PaginationDto } from 'libs/shared/bases'

export class filterDto extends PaginationDto {
	// @IsOptional()
	// name?: string
	// @IsOptional()
	// description?: string

	// search
	@IsOptional()
	keySearch?: string
	@IsOptional()
	price?: string
	@IsOptional()
	type?: string
	@IsOptional()
	shop?: string
	@IsOptional()
	ratingsAverage?: string
	@IsOptional()
	size?: string
	@IsOptional()
	color?: string
}

export class SearchParam extends PaginationDto {
	@IsOptional()
	KeySearch?: string
}
