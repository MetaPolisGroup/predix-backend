"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseGenericStorage = void 0;
const configuration_1 = require("src/configuration");
class FirebaseGenericStorage {
    constructor(bucket, path) {
        this.bucket = bucket;
        this.path = path;
    }
    async uploadImage(file) {
        const fileUpload = this.bucket.file(this.path + '/' + file.originalname);
        await fileUpload.save(file.buffer, {
            gzip: true,
            metadata: { contentType: file.mimetype },
        });
        const signedUrl = await this.getImageUrl(file.originalname);
        return signedUrl;
    }
    async getImageUrl(filename) {
        const file = this.bucket.file(this.path + '/' + filename);
        const { DAY, MONTH, YEAR } = configuration_1.default.STORAGE.EXPIRED_DATE;
        const [url] = await file.getSignedUrl({
            action: configuration_1.default.STORAGE.ACTION,
            expires: `${MONTH}-${DAY}-${YEAR}`,
        });
        return url;
    }
}
exports.FirebaseGenericStorage = FirebaseGenericStorage;
//# sourceMappingURL=firebase-storage-generic.js.map