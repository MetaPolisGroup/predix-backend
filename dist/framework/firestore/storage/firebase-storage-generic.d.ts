/// <reference types="multer" />
import { Bucket } from '@google-cloud/storage';
import { IFirebaseGenericStorage } from 'src/core/abstract/data-services/storage/generic-storage.abstract';
export declare class FirebaseGenericStorage implements IFirebaseGenericStorage {
    private readonly bucket;
    private readonly path;
    constructor(bucket: Bucket, path: string);
    uploadImage(file: Express.Multer.File): Promise<string>;
    getImageUrl(filename: string): Promise<string>;
}
