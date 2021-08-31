import { Injectable, NestMiddleware } from '@nestjs/common'
import { IncomingMessage, ServerResponse } from 'http'

@Injectable()
export class SkipBrowserDefaultRequestMiddleware implements NestMiddleware {
  async use(req: IncomingMessage, res: ServerResponse, next: () => void) {
    // @ts-ignore
    const url = req.originalUrl

    if (url.match(/favicon.ico$/) || url.match(/manifest.json$/)) {
      res.writeHead(204)
      return res.end()
    }
    next()
  }
}
