import { ForbiddenError } from '@casl/ability'
import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AppAbility, CaslAbilityFactory } from './ability.factory'
import { CHECK_ABILITY, ReruiredRule } from './ability.decorator'

@Injectable()
export class AbilityGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private caslAbilityFactory: CaslAbilityFactory
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const rules = this.reflector.get<ReruiredRule[]>(CHECK_ABILITY, context.getHandler()) || []

		const { user } = context.switchToHttp().getRequest()
		const ability = this.caslAbilityFactory.defineAbility(user)

		try {
			rules.forEach((rule) => {
				ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject)
			})
			return true
		} catch (error) {
			throw new ForbiddenException(error.message)
		}
	}
}
//   private execPolicyHandler(handler: ReruiredRule, ability: AppAbility) {
//     if (typeof handler === 'function') {
//       return handler(ability);
//     }
//     return handler.handle(ability);
//   }
// }
