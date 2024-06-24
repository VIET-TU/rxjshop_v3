import {
	DataSource,
	EntitySubscriberInterface,
	EventSubscriber,
	InsertEvent,
	RemoveEvent,
} from 'typeorm'

@EventSubscriber()
export class EntitySubscriber<Entity> implements EntitySubscriberInterface<Entity> {
	constructor(dataSource: DataSource) {
		dataSource.subscribers.push(this)
	}

	afterInsert(event: InsertEvent<Entity>) {
		event.manager['entities'].inserted.push(event.entity)
	}

	afterRemove(event: RemoveEvent<Entity>) {
		event.manager['entities'].removed.push(event.entity)
	}

	beforeTransactionStart(event) {
		event.manager['entities'] = event.manager['entities'] || {
			inserted: [],
			removed: [],
			updated: [],
		}
	}
}
