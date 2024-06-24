import { SetMetadata } from '@nestjs/common'
import { Action, Subjects, User } from './ability.factory'

export interface ReruiredRule {
	action: Action
	subject: Subjects
}

export const CHECK_ABILITY = 'check_ability'

export const CheckAbilities = (...requirements: ReruiredRule[]) =>
	SetMetadata(CHECK_ABILITY, requirements)

export class ReadUserAbility implements ReruiredRule {
	action: Action.Read
	subject: User
}
