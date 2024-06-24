import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Post,
	Request,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common'

import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { Services } from 'libs/shared/utils/constants'
import { ResponseInterceptor } from 'libs/shared/utils/reponse.interceptor'
import { ConfirmEmailDto } from './dtos/AuthConfirmEmailDto '
import { VertifyOtpDto } from './dtos/VertifyOtpDto'
import { loginDto } from './dtos/login.dto'
import { RegisterDto } from './dtos/register.dto'
import { IAuthService } from './interfaces/auth.interface'
import { ConfirmEmailReponse, LoginResponseType, MeType } from './types/auth.type'
import { UserEntity } from '../user/entities/user.entity'
import { AuthService } from './services/auth.service'
import { ChangePasswordDto } from './dtos/ChangePassword.dto'
import { Roles } from 'libs/shared/utils/decorator/roles.decorator'
import { Role } from 'libs/shared/utils/enums/role.enum'
import { RolesGuard } from 'libs/shared/utils/guards/roles.guard'

@Controller('auth')
export class AuthController {
	constructor(@Inject(Services.AUTH) private readonly authService: AuthService) {}

	@Get('check-admin')
	@Roles(Role.Admin)
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('Check  admin'))
	async checkAdmin(@Request() req) {
		const { user } = req
		return await this.authService.checkAdmin(user.id)
	}

	@Post('vertify-email')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(new ResponseInterceptor('Send Otp successfully'))
	async ConfirmEmail(@Body() payload: ConfirmEmailDto): Promise<ConfirmEmailReponse> {
		return await this.authService.ConfirmEmail(payload)
	}

	@Post('vertify-otp')
	@HttpCode(HttpStatus.OK)
	@UseInterceptors(new ResponseInterceptor('Email verified successfully'))
	async vertiyOtp(@Body() vertifyOtpDto: VertifyOtpDto): Promise<string> {
		return await this.authService.vertiyOtp(vertifyOtpDto)
	}

	@Post('register')
	@UseInterceptors(new ResponseInterceptor('Crete user successfully'))
	async register(@Body() registerDto: RegisterDto): Promise<UserEntity> {
		return await this.authService.register(registerDto)
	}

	@Post('login')
	@UseInterceptors(new ResponseInterceptor('Login successfully'))
	async login(
		@Body() LoginDto: loginDto,
		@Res({ passthrough: true }) res: Response
	): Promise<LoginResponseType> {
		return await this.authService.login(LoginDto, res)
	}

	@Post('refresh')
	@UseGuards(AuthGuard('jwt-refresh'))
	@UseInterceptors(new ResponseInterceptor('Refresh token successfully'))
	async refreshToken(@Request() req, @Res({ passthrough: true }) res: Response): Promise<MeType> {
		return this.authService.refreshToken(req, res)
	}

	@Post('logout')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('logout successfully'))
	@HttpCode(HttpStatus.NO_CONTENT)
	async logout(@Request() req, @Res({ passthrough: true }) res: Response): Promise<any> {
		await this.authService.logout(req, res)
		return {
			logout: 'success',
		}
	}

	@Post('forget-password')
	@UseInterceptors(new ResponseInterceptor('Send email url forgetpassword'))
	async forgetPassword(@Body() email: any) {
		return await this.authService.forgetPassword(email)
	}

	@Post('change-password')
	@UseInterceptors(new ResponseInterceptor('Change password successfully'))
	async changepassword(@Body() payload: ChangePasswordDto) {
		return this.authService.changePassowrd(payload)
	}

	@Get('me')
	@UseGuards(AuthGuard('jwt'))
	@UseInterceptors(new ResponseInterceptor('Client logined'))
	async me(@Request() req) {
		return UserEntity.plainToInstance(req.user)
	}
}
