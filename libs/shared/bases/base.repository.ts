/* eslint-disable @typescript-eslint/ban-ts-comment */

import { NotFoundException } from '@nestjs/common'
import {
	DeepPartial,
	FindOptionsOrder,
	FindOptionsRelationByString,
	FindOptionsRelations,
	FindOptionsSelect,
	FindOptionsWhere,
	Repository,
	SelectQueryBuilder,
} from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { PaginationDto } from './base.dto'
import { BaseEntity } from './base.entity'
import { UserEntity } from 'apps/rxjshop_v2/src/user/entities/user.entity'

export abstract class BaseRepository<Entity extends BaseEntity> {
	name: string

	constructor(public readonly repo: Repository<Entity>) {}

	async getAll({
		where,
		relations,
		select,
	}: {
		where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]
		relations?: FindOptionsRelations<Entity> | FindOptionsRelationByString
		select?: FindOptionsSelect<Entity>
	}): Promise<Entity[]> {
		return this.repo.find({ where, relations, select })
	}

	async getOne({
		where,
		relations,
		select,
	}: {
		where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]
		relations?: FindOptionsRelations<Entity> | FindOptionsRelationByString
		select?: FindOptionsSelect<Entity>
	}): Promise<Entity | null> {
		return this.repo.findOne({ where, relations, select })
	}

	async getOneById(id: string, ...relations: string[]): Promise<Entity | null> {
		//@ts-ignore
		return this.repo.findOne({ where: { id }, relations })
	}

	async getOneOrFail({
		where,
		relations,
		select,
	}: {
		where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]
		relations?: FindOptionsRelations<Entity>
		select?: FindOptionsSelect<Entity>
	}): Promise<Entity> {
		const entity = this.repo.findOne({ where, relations, select })
		if (!entity) {
			const errorMessage = `${this.name} not found`
			throw new NotFoundException(errorMessage)
		}
		return entity
	}

	async getOneByIdOrFail(id: string, ...relations: string[]): Promise<Entity> {
		//@ts-ignore
		const entity = await this.repo.findOne({ where: { id }, relations })
		if (!entity) {
			const errorMessage = `${this.name} not found`
			throw new NotFoundException(errorMessage)
		}
		return entity
	}

	async create(data: DeepPartial<Entity>): Promise<Entity> {
		return this.repo.create(data).save()
	}

	async createMany(data: DeepPartial<Entity>[]): Promise<Entity[]> {
		const result: Entity[] = []
		const newEntities = this.repo.create(data)
		for (let i = 0; i < newEntities.length; i++) {
			const newEntity = await newEntities[i].save()
			result.push(newEntity)
		}
		return result
	}

	async update(entity: Entity, data: QueryDeepPartialEntity<Entity>) {
		const keys = Object.keys(data)
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i]
			entity[key] = data[key]
		}
		return entity.save()
	}

	async updatePassword(id: string, password: string) {
		return await UserEntity.update({ id }, { password })
	}

	async updateBy(
		where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
		data: QueryDeepPartialEntity<Entity>
	) {
		const entity = await this.getOneOrFail({ where })
		return this.update(entity, data)
	}

	async updateById(id: string, data: QueryDeepPartialEntity<Entity>) {
		const entity = await this.getOneByIdOrFail(id)
		return this.update(entity, data)
	}

	async deleteBy(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]) {
		const entity = await this.getOneOrFail({ where })
		return this.repo.remove(entity)
	}

	async deleteById(id: string) {
		const entity = await this.getOneByIdOrFail(id)
		return this.repo.remove(entity)
	}

	async softDelete(where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]) {
		const entity = await this.getOneOrFail({ where })
		return this.repo.softRemove(entity)
	}

	async softDeleteById(id: string) {
		const entity = await this.getOneByIdOrFail(id)
		return this.repo.softRemove(entity)
	}

	async getAllWithPagination(
		query: PaginationDto,
		where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
		order?: FindOptionsOrder<Entity>,
		...relations: string[]
	): Promise<Entity[]> {
		const queryBuilder = await this.getQueryBuilder(this.repo, query, where, order, ...relations)
		return queryBuilder.getMany()
	}

	async getQueryBuilder(
		repo: any,
		query: any,
		where?: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
		order?: FindOptionsOrder<Entity>,
		...relations: string[]
	) {
		const limit = query.limit ? query.limit : '10'
		const page = query.page !== '0' ? query.page : '1'
		const skip = parseInt(limit) * (parseInt(page) - 1)
		const take = parseInt(limit)
		delete query.limit
		delete query.page
		let queryBuilder = repo.createQueryBuilder('entity')
		queryBuilder = this.addRelations(queryBuilder, relations)
		if (where) {
			queryBuilder = this.addWhere(queryBuilder, where)
			queryBuilder = this.addQuery(queryBuilder, where, query)
		}
		queryBuilder.skip(skip).take(take)
		for (const orderKey in order) {
			queryBuilder.orderBy(`entity.${orderKey}`, order[orderKey] as any)
		}
		return queryBuilder
	}

	addRelations(queryBuilder: SelectQueryBuilder<Entity>, relations: string[]) {
		relations.forEach((relation) => {
			queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation)
		})
		return queryBuilder
	}
	addWhere(
		queryBuilder: SelectQueryBuilder<Entity>,
		where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[]
	) {
		const whereKeys = Object.keys(where)
		for (let i = 0; i < whereKeys.length; i++) {
			const key = whereKeys[i]
			let queryString = `entity.${key} = ${where[key]}`
			if (typeof where[key] === 'string') {
				queryString = `entity.${key} = '${where[key]}'`
			}
			let whereMethod = 'andWhere'
			if (i === 0) {
				whereMethod = 'where'
			}
			queryBuilder[whereMethod](queryString)
		}
		return queryBuilder
	}
	addQuery(
		queryBuilder: SelectQueryBuilder<Entity>,
		where: FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[],
		query: any
	) {
		const whereKeys = Object.keys(where)
		const queryKeys = Object.keys(query)
		queryKeys.forEach((key) => {
			const value: string = query[key]
			const queryObjects = key.split('.')
			let queryString = `entity.${key} LIKE '%${value}%'`
			let whereMethod = 'andWhere'
			if (whereKeys.length === 0) {
				whereMethod = 'where'
			}
			if (queryObjects.length > 1) {
				queryString = `${key} LIKE '%${value}%'`
			}
			queryBuilder[whereMethod](queryString)
		})
		return queryBuilder
	}
}
