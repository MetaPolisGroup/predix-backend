
export abstract class ILogger {
    abstract error(message: string, context?: string): void

    abstract warn(message: string, context?: string): void

    abstract debug(message: string, context?: string): void

    abstract log(message: string, context?: string): void
}
