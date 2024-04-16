import { Bucket } from '@google-cloud/storage';
import constant from 'src/configuration';
import { IFirebaseGenericStorage } from 'src/core/abstract/data-services/storage/generic-storage.abstract';

export class FirebaseGenericStorage implements IFirebaseGenericStorage {
    private readonly bucket: Bucket;

    private readonly path: string;

    constructor(bucket: Bucket, path: string) {
        this.bucket = bucket;
        this.path = path;
    }

    async uploadImage(file: Express.Multer.File): Promise<string> {
        // Generate a unique filename with a UUID
        const fileUpload = this.bucket.file(this.path + '/' + file.originalname);

        await fileUpload.save(file.buffer, {
            gzip: true,
            metadata: { contentType: file.mimetype },
        });

        const signedUrl = await this.getImageUrl(file.originalname);
        // https://firebasestorage.googleapis.com/v0/b/korea-sport-bet.appspot.com/o/events%2Favt.jpg?alt=media&token=ca718897-c389-4226-b055-450755a28657
        return signedUrl;
    }

    async getImageUrl(filename: string): Promise<string> {
        const file = this.bucket.file(this.path + '/' + filename);
        const { DAY, MONTH, YEAR } = constant.STORAGE.EXPIRED_DATE;
        const [url] = await file.getSignedUrl({
            action: constant.STORAGE.ACTION,
            expires: `${MONTH}-${DAY}-${YEAR}`, // or any desired future date
        });
        return url;
    }
}
