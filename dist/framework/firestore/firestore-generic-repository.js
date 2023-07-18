"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirestoreGenericRepository = void 0;
const common_1 = require("@nestjs/common");
class FirestoreGenericRepository {
    constructor(firestore, collectionName) {
        this.firestore = firestore;
        this.collectionName = collectionName;
        this.collectionRef = this.firestore.collection(this.collectionName);
        this.Logger = new common_1.Logger(FirestoreGenericRepository.name);
    }
    async getCollectionData() {
        const collectionSnapshot = await this.collectionRef.get();
        if (collectionSnapshot.empty) {
            return null;
        }
        const data = collectionSnapshot.docs.map(doc => doc.data());
        return data;
    }
    async getFirstValueCollectionData() {
        const collectionSnapshot = await this.collectionRef.get();
        if (collectionSnapshot.empty) {
            return null;
        }
        const data = collectionSnapshot.docs.map(doc => doc.data());
        return data.length > 0 ? data[0] : null;
    }
    async getCollectionDataByConditions(conditions) {
        let query = this.collectionRef;
        for (const condition of conditions) {
            query = query.where(condition.field, condition.operator, condition.value);
        }
        const collectionSnapshot = await query.get();
        if (collectionSnapshot.empty) {
            return null;
        }
        const data = collectionSnapshot.docs.map(doc => {
            if (!doc.data().id) {
                const documentData = doc.data();
                documentData.id = doc.id;
                return documentData;
            }
            return doc.data();
        });
        return data;
    }
    async getFirstValueCollectionDataByConditions(conditions) {
        let query = this.collectionRef;
        for (const condition of conditions) {
            query = query.where(condition.field, condition.operator, condition.value);
        }
        const collectionSnapshot = await query.get();
        if (collectionSnapshot.empty) {
            return null;
        }
        const data = collectionSnapshot.docs.map(doc => {
            if (!doc.data().id) {
                const documentData = doc.data();
                documentData.id = doc.id;
                return documentData;
            }
            return doc.data();
        });
        return data.length > 0 ? data[0] : null;
    }
    async getDocumentData(documentId) {
        const documentRef = this.collectionRef.doc(documentId);
        const documentSnapshot = await documentRef.get();
        if (!documentSnapshot.exists) {
            return null;
        }
        return documentSnapshot.data();
    }
    getDocumentRef(documentId) {
        const documentRef = this.collectionRef.doc(documentId);
        return documentRef;
    }
    async createDocumentData(documentData) {
        const documentRef = this.collectionRef.doc();
        const id = documentRef.id;
        const document = Object.assign({ id }, documentData);
        return documentRef.set(document).then(() => document);
    }
    async updateDocumentData(documentId, documentData) {
        const documentRef = this.collectionRef.doc(documentId);
        await documentRef.update(documentData).then(() => (Object.assign({ id: documentId }, documentData)));
        const result = Object.assign({ id: documentId }, documentData);
        return result;
    }
    async upsertDocumentData(documentId, documentData) {
        const documentRef = this.collectionRef.doc(documentId);
        await documentRef.set(documentData, { merge: true });
        return documentData;
    }
    async deleteDocumentData(documentId) {
        const documentRef = this.collectionRef.doc(documentId);
        await documentRef.delete();
    }
    deleteDocumentByConditions(conditions) {
        let query = this.collectionRef;
        for (const condition of conditions) {
            query = query.where(condition.field, condition.operator, condition.value);
        }
        query
            .get()
            .then(snapshot => {
            snapshot.forEach(doc => {
                doc.ref
                    .delete()
                    .then(() => {
                    this.Logger.log(`Document with ID ${doc.id} successfully deleted`);
                })
                    .catch(error => {
                    this.Logger.error(`Error deleting document with ID ${doc.id}:`, error);
                });
            });
        })
            .catch(error => {
            this.Logger.error('Error getting documents:', error);
        });
    }
    listenToChangesWithConditions(conditions, callback) {
        let query = this.collectionRef;
        if (conditions) {
            for (const condition of conditions) {
                query = query.where(condition.field, condition.operator, condition.value);
            }
        }
        if (!query) {
            return null;
        }
        query.onSnapshot(async (s) => {
            const result = s.docChanges().map(change => {
                const data = {
                    doc: change.doc.data(),
                    newIndex: change.newIndex,
                    oldIndex: change.oldIndex,
                    type: change.type,
                };
                return data;
            });
            await callback(result);
        });
    }
    listenToChangesWithConditionsOrigin(conditions, callback) {
        let query = this.collectionRef;
        if (conditions) {
            for (const condition of conditions) {
                query = query.where(condition.field, condition.operator, condition.value);
            }
        }
        if (!query) {
            return null;
        }
        query.onSnapshot(async (s) => {
            const result = s.docs.map(change => {
                const data = {
                    doc: change.data(),
                };
                return data;
            });
            await callback(result);
        });
    }
    listenToChangesOnCollection(callback) {
        const query = this.collectionRef;
        let result;
        query.onSnapshot(async (s) => {
            result = s.docChanges().map(change => {
                const data = {
                    doc: change.doc.data(),
                    newIndex: change.newIndex,
                    oldIndex: change.oldIndex,
                    type: change.type,
                };
                return data;
            });
            await callback(result);
        });
    }
    async getCollectionDataByConditionsAndOrderBy(conditions, orderBys) {
        let query = this.collectionRef;
        for (const condition of conditions) {
            query = query.where(condition.field, condition.operator, condition.value);
        }
        for (const orderBy of orderBys) {
            query = query.orderBy(orderBy.field, orderBy.option);
        }
        const collectionSnapshot = await query.get();
        if (collectionSnapshot.empty) {
            return null;
        }
        const data = collectionSnapshot.docs.map(doc => {
            if (!doc.data().id) {
                const documentData = doc.data();
                documentData.id = doc.id;
                return documentData;
            }
            return doc.data();
        });
        return data;
    }
    async getCollectionDataFirstValueAndOrderBy(orderBy) {
        let query = this.collectionRef;
        if (orderBy) {
            for (const ob of orderBy) {
                query = query.orderBy(ob.field, ob === null || ob === void 0 ? void 0 : ob.option);
            }
        }
        const querySnapshot = await query.get();
        const data = querySnapshot.docs.map(doc => doc.data());
        return data.length > 0 ? data[0] : null;
    }
}
exports.FirestoreGenericRepository = FirestoreGenericRepository;
//# sourceMappingURL=firestore-generic-repository.js.map