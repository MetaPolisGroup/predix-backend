import { Injectable, Logger } from '@nestjs/common';

// @Injectable()
export class MyLoggerService {
  private logger: Logger;

  private primaryColor: string;

  private secondaryColor: string;

  constructor(name: string, primaryColor: string, secondaryColor: string) {
    this.logger = new Logger(name);
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
  }

  error(message: string) {
    this.logger.error(message);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  log1(message: string) {
    this.logger.log(this.hexToAnsi(this.primaryColor, message));
  }

  log2(message: string) {
    this.logger.log(this.hexToAnsi(this.secondaryColor, message));
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
