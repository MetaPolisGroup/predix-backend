import { Logger } from '@nestjs/common';
import { ILogger } from 'src/core/abstract/logger/logger.abstract';

export class CustomLogger implements ILogger {
    private logger: Logger;

    private color: string;

    constructor(name: string, color: string) {
        this.logger = new Logger(name);
        this.color = color;
    }

    log(message: string, context?: string): void {
        if (context) {
            this.logger.log(this.hexToAnsi(this.color, message), context);
        } else {
            this.logger.log(this.hexToAnsi(this.color, message));
        }
    }

    error(message: string, context?: string) {
        if (context) {
            this.logger.error(this.hexToAnsi(this.color, message), context);
        } else {
            this.logger.error(this.hexToAnsi(this.color, message));
        }
    }

    warn(message: string, context?: string) {
        if (context) {
            this.logger.warn(this.hexToAnsi(this.color, message), context);
        } else {
            this.logger.warn(this.hexToAnsi(this.color, message));
        }
    }

    debug(message: string, context?: string) {
        if (context) {
            this.logger.debug(this.hexToAnsi(this.color, message), context);
        } else {
            this.logger.debug(this.hexToAnsi(this.color, message));
        }
    }

    private hexToAnsi(hexColor: string, message: string) {
        // Ensure the input is a valid 6-digit hex color code
        const hexRegex = /^#?([0-9A-Fa-f]{6})$/;
        const match = hexColor.match(hexRegex);

        if (!match) {
            throw new Error('Invalid hex color code. Please provide a valid 6-digit hex color.');
        }

        // Extract the RGB values from the hex color code
        const hex = match[1];
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        // ANSI color codes for 256 colors
        const ansiColor = `\x1b[38;2;${r};${g};${b}m`;

        return `${ansiColor}${message}.\x1b[0m`;
    }
}
