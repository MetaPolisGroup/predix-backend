export declare abstract class IFirebaseGenericStorage {
    abstract uploadImage(file: Express.Multer.File): Promise<string>;
    abstract getImageUrl(fileName: string): Promise<string>;
}
