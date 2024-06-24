import { ExtractJwt, Strategy } from 'passport-jwt'
import { Inject, Injectable, forwardRef, HttpStatus, HttpException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { HEADER } from '../enums/header.enum'
import { KeyTokenService } from '../services/keyToken.service'
import { JwtPayoadType } from './types/jwt-payload-types'
import { Services } from 'libs/shared/utils/constants'
import { HeadKey, RedisService } from 'libs/shared/redis/redis.service'
import { UserService } from '../../user/services/user.service'
import { UserEntity } from '../../user/entities/user.entity'
import { UserRepository } from '../../user/repositories/user.repository'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		@Inject(Services.USERS) private readonly userService: UserService,
		private readonly redisService: RedisService,
		private readonly userRepo: UserRepository
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken()]),
			ignoreExpiration: false,
			passReqToCallback: true,
			secretOrKeyProvider: async (req: Request, _, done) => {
				try {
					console.log('debug')
					const userId = req.headers[HEADER.CLIENT_ID] as string
					console.log('userId', userId)
					if (!userId) throw new HttpException('Invalid request', HttpStatus.UNAUTHORIZED)
					const publicKey = await this.redisService.getOnKey(HeadKey.AC_TOKEN, userId)
					if (!publicKey) throw new HttpException('Not found PublicKey`', HttpStatus.UNAUTHORIZED)
					done(null, publicKey)
				} catch (error) {
					console.log('error', error)
					done(error)
				}
			},
		})
	}
	async validate(req: Request, { payload }: { payload: JwtPayoadType }): Promise<UserEntity> {
		// after encry token
		if (payload.userId !== req.headers[HEADER.CLIENT_ID])
			throw new HttpException('Invaild userId', HttpStatus.BAD_REQUEST)
		const user = await this.userRepo.getOne({
			where: {
				id: payload.userId,
			},
		})
		if (!user) {
			throw new HttpException('User not registered', HttpStatus.UNAUTHORIZED)
		}
		return user as UserEntity
	}
}
