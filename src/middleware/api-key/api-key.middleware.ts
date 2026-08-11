import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, Request } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {

    const apiKey = req.headers['x-api-key'];
    if (apiKey !== 'secret-key-123') {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  }
}
