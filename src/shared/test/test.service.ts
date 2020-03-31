import { Injectable } from '@nestjs/common'
import { EventsGateway } from 'src/gateway/events.gateway'

@Injectable()
export class TestService {
  constructor(private readonly socket: EventsGateway) {}

  sendMessage() {
    this.socket.sendMessage('hello', 'world')
  }
}
