import { FindOptionsOrder, FindOptionsWhere, Repository } from 'typeorm'
import { PaginationDto } from './base.dto'
import { BaseEntity } from './base.entity'

export abstract class BaseService<Entity extends BaseEntity> {
	constructor(public readonly repo: Repository<Entity>) {}

	// async getAll(
	// 	where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
	// 	...relations: string[]
	// ): Promise<Entity[]> {
	// 	return this.repo.find({ where, relations })
	// }

	// async getAllWithPagination(
	// 	query: PaginationDto,
	// 	where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
	// 	order?: FindOptionsOrder<Entity>,
	// 	...relations: string[]
	// ): Promise<Entity[]> {
	// 	const queryBuilder = getQueryBuilder(this.repo, query, where, order, ...relations)
	// 	return queryBuilder.getMany()
	// }
}
