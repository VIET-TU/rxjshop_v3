import { ConfirmEmailDto } from '../dtos/AuthConfirmEmailDto '
import { VertifyOtpDto } from '../dtos/VertifyOtpDto'
import { RegisterDto } from '../dtos/register.dto'

import { loginDto } from '../dtos/login.dto'
import { Response } from 'express'
import { ConfirmEmailReponse, LoginResponseType, MeType } from '../types/auth.type'
import { UserEntity } from '../../user/entities/user.entity'

export interface IAuthService {
	ConfirmEmail(email: ConfirmEmailDto): Promise<ConfirmEmailReponse>
	vertiyOtp(vertifyOtpDto: VertifyOtpDto): Promise<any>
	register(registerDto: RegisterDto): Promise<UserEntity>
	login(LoginDto: loginDto, res: Response): Promise<LoginResponseType>
	refreshToken(req: any, res: Response): Promise<MeType>
	logout(req: any, res: Response): Promise<void>
	forgetPassword(email): Promise<boolean>
}
