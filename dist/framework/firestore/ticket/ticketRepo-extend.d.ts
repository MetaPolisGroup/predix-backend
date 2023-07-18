import { IMessage, ticket } from 'src/core/entities';
import { FirestoreGenericRepository } from '../firestore-generic-repository';
import { Firestore } from '@google-cloud/firestore';
import { collectionsName } from 'src/configuration/type/firebase/firebase.type';
export declare class FirestoreTicketRepository<T extends ticket> extends FirestoreGenericRepository<T> {
    constructor(firestore: Firestore, collectionName: collectionsName);
    createMessageSubDoc(ticketId: string, documentData: IMessage): Promise<IMessage>;
    getMessageCollection(ticketId: string): Promise<IMessage[]>;
}
