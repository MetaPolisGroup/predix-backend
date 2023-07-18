import { Server } from "socket.io";
export declare class PredictionGateway {
    server: Server;
    listenForMessages(data: string): void;
}
