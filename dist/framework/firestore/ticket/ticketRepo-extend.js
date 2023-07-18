"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreTicketRepository = void 0;
const firestore_generic_repository_1 = require("../firestore-generic-repository");
class FirestoreTicketRepository extends firestore_generic_repository_1.FirestoreGenericRepository {
    constructor(firestore, collectionName) {
        super(firestore, collectionName);
    }
    async createMessageSubDoc(ticketId, documentData) {
        const docRef = this.collectionRef.doc(ticketId);
        const subcollectionDocRef = docRef.collection('messages').doc();
        const id = subcollectionDocRef.id;
        const document = Object.assign({ id }, documentData);
        return await subcollectionDocRef.set(document).then(() => document);
    }
    async getMessageCollection(ticketId) {
        const docRef = this.collectionRef.doc(ticketId);
        const collectionSnapshot = await docRef.collection('messages').get();
        if (collectionSnapshot.empty) {
            console.log(`Collection ${this.collectionName} is Empty`);
            return null;
        }
        const data = collectionSnapshot.docs.map(doc => doc.data());
        return data;
    }
}
exports.FirestoreTicketRepository = FirestoreTicketRepository;
//# sourceMappingURL=ticketRepo-extend.js.map