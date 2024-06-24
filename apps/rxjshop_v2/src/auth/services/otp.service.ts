import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common'
import { HeadKey, RedisService } from 'libs/shared/redis/redis.service'
import { compareHash, hashX } from 'libs/shared/utils/helpers'

@Injectable()
export class OtpService {
	constructor(
		@Inject(forwardRef(() => RedisService)) private readonly redisService: RedisService
	) {}

	async vaildOtp(email, otp): Promise<boolean> {
		const otpHolder = await this.redisService.getOnKey(HeadKey.Otp, email)
		if (!otpHolder) {
			throw new HttpException('Expired OTP', HttpStatus.FORBIDDEN)
		}
		return await compareHash(otp, otpHolder)
	}

	async insertOtp(OTP, email): Promise<number> {
		const hashOtp = await hashX(OTP)
		const IsOtp = await this.redisService.setOnKey(HeadKey.Otp, email, hashOtp, 2 * 60)
		return IsOtp ? 1 : 0
	}

	async deleteOtp(email) {
		await this.redisService.delOnKey(HeadKey.Otp, email)
	}
}
