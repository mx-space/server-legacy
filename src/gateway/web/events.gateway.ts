import {
  GatewayMetadata,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets'
import { BaseGateway } from '../base.gateway'
import { EventTypes } from '../events.types'

@WebSocketGateway<GatewayMetadata>({
  namespace: 'web',
})
export class WebEventsGateway extends BaseGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {
    super()
  }

  @SubscribeMessage(EventTypes.VISITOR_ONLINE)
  sendOnlineNumber() {
    return {
      online: this.wsClients.length,
      timestamp: new Date().toISOString(),
    }
  }

  handleConnection(client: SocketIO.Socket) {
    this.wsClients.push(client)
    this.broadcase(EventTypes.VISITOR_ONLINE, this.sendOnlineNumber())
  }
  handleDisconnect(client: SocketIO.Socket) {
    super.handleDisconnect(client)
    this.broadcase(EventTypes.VISITOR_OFFLINE, this.sendOnlineNumber())
  }
}
