import {
	Ability,
	AbilityBuilder,
	AbilityClass,
	ExtractSubjectType,
	InferSubjects,
} from '@casl/ability'
import { Injectable } from '@nestjs/common'

export enum Action {
	Manage = 'manage',
	Create = 'create',
	Read = 'read',
	Update = 'update',
	Delete = 'delete',
}

export class User {
	id: number
	isAdmin: boolean
	orgId: number
}

export type Subjects = InferSubjects<typeof User> | 'all'

export type AppAbility = Ability<[Action, Subjects]>

@Injectable()
export class CaslAbilityFactory {
	defineAbility(user: User) {
		const { can, cannot, build } = new AbilityBuilder(Ability as AbilityClass<AppAbility>)
		if (user.isAdmin) {
			can(Action.Manage, 'all')
			cannot(Action.Manage, User, { orgId: { $ne: user.orgId } })
		} else {
			can(Action.Read, 'all')
			cannot(Action.Create, User).because('your sepecial message: only admins!!!')
		}

		return build({
			detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
		})
	}
}
