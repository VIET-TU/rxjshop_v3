import { BadRequestException, Injectable } from '@nestjs/common'
import { UserRepository } from '../repositories/user.repository'

import { UserEntity } from '../entities/user.entity'
import { plainToClass } from 'class-transformer'
import { RegisterDto } from '../../auth/dtos/register.dto'
import { UpdateUserDto } from '../dtos/UpdateUser.dto'
import { MediaService } from 'libs/shared/media/services/media.service'
import { DataSource } from 'typeorm'
import { ChangePassWordDto } from '../dtos/ChangePassword.dto'
import { compareHash, hashX } from 'libs/shared/utils/helpers'

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		private readonly mediaService: MediaService,
		private dataSource: DataSource
	) {}

	async findOneUserByEmail(email: string): Promise<UserEntity> {
		return await this.userRepository.getOne({ where: { email } })
	}

	async createUser(createUserDto: RegisterDto): Promise<UserEntity> {
		const user = await this.userRepository.create(createUserDto)
		return UserEntity.plainToInstance(user)
	}

	async findOneUserById(id: string): Promise<UserEntity> {
		return await this.userRepository.getOneById(id)
	}

	async updatePassword(id: string, password: string) {
		return await this.userRepository.updatePassword(id, password)
	}

	async updateUser(
		user: UserEntity,
		{ fullName, avatar: _avatar, ...payload }: UpdateUserDto,
		avatar: File
	) {
		const nameParts = fullName.split(' ')
		const firstName = nameParts[0]
		const lastName = nameParts.slice(1).join(' ')
		let userUpdate = { ...user, ...payload, firstName, lastName } as UserEntity

		if (avatar) {
			const avatar_ = await this.mediaService.uploadAndGetLink(avatar)
			userUpdate = { ...userUpdate, avatar: avatar_ } as UserEntity
			// delete old avatar
			try {
				await this.dataSource.transaction(async (manager) => {
					const parts = user.avatar.split('/')
					const key = parts[3] + '/' + parts[4].split('?')[0]
					await this.mediaService.deleteMediaById(key, manager)
				})
			} catch (error) {
				console.log('error', error)
			}
		}
		await this.userRepository.updateById(user.id, userUpdate)
		return UserEntity.plainToInstance(userUpdate)
	}

	async changePassword(user: UserEntity, payload: ChangePassWordDto) {
		// cofirm password
		const isValid = await compareHash(payload.currentPasswd, user.password)
		if (!isValid) throw new BadRequestException('Current password is not correct!')
		return this.updatePassword(user.id, await hashX(payload.newPasswd))
	}
}
