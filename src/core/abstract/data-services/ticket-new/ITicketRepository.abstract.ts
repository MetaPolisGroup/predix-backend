import { IMessage, ticket } from 'src/core/entities';
import { IGenericRepository } from '../generic-repository.abstract';

export abstract class ITicketRepository<T extends ticket> extends IGenericRepository<T> {
  abstract createMessageSubDoc(ticketId: string, documentData: IMessage): Promise<IMessage>;

  abstract getMessageCollection(ticketId: string): Promise<IMessage[]>;
}
