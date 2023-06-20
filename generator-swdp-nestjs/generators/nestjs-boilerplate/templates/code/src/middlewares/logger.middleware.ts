import { Inject, Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { Logger } from "winston";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  use(request: Request, response: Response, next: NextFunction) {
    response.on("close", () => {
      if (response.statusCode >= 400) {
        this.logger.log({
          level: "error",
          method: request.method,
          message: response.statusMessage,
        });
      } else {
        this.logger.log({
          level: "info",
          method: request.method,
          message: response.statusMessage,
        });
      }
    });
    next();
  }
}
