/*
 * @Author: Innei
 * @Date: 2020-05-21 11:05:42
 * @LastEditTime: 2020-05-23 19:58:00
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/gateway/events.types.ts
 * @MIT
 */

export enum EventTypes {
  GATEWAY_CONNECT = 'GATEWAY_CONNECT',
  GATEWAY_DISCONNECT = 'GATEWAY_DISCONNECT',

  VISITOR_ONLINE = 'VISITOR_ONLINE',
  VISITOR_OFFLINE = 'VISITOR_OFFLINE',

  AUTH_FAILED = 'AUTH_FAILED',

  COMMENT_CREATE = 'COMMENT_CREATE',

  POST_CREATE = 'POST_CREATE',
  POST_UPDATE = 'POST_UPDATE',
  POST_DELETE = 'POST_DELETE',

  NOTE_CREATE = 'NOTE_CREATE',
  NOTE_UPDATE = 'NOTE_UPDATE',
  NOTE_DELETE = 'NOTE_DELETE',

  DANMAKU_CREATE = 'DANMAKU_CREATE',
}
