import { IMessage, ticket } from 'src/core/entities';
import { FirestoreGenericRepository } from '../firestore-generic-repository';
import { Firestore } from '@google-cloud/firestore';
import { collectionsName } from 'src/configuration/type/firebase/firebase.type';

export class FirestoreTicketRepository<T extends ticket> extends FirestoreGenericRepository<T> {
  constructor(firestore: Firestore, collectionName: collectionsName) {
    super(firestore, collectionName);
  }

  async createMessageSubDoc(ticketId: string, documentData: IMessage): Promise<IMessage> {
    const docRef = this.collectionRef.doc(ticketId);
    const subcollectionDocRef = docRef.collection('messages').doc();

    const id = subcollectionDocRef.id;
    const document = { id, ...documentData };
    return await subcollectionDocRef.set(document).then(() => document);
  }

  async getMessageCollection(ticketId: string): Promise<IMessage[]> {
    const docRef = this.collectionRef.doc(ticketId);
    const collectionSnapshot = await docRef.collection('messages').get();

    if (collectionSnapshot.empty) {
      console.log(`Collection ${this.collectionName} is Empty`);
      return null;
    }

    const data = collectionSnapshot.docs.map(doc => doc.data() as IMessage);

    return data;
  }
}
