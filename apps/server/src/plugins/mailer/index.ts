/*
 * @Author: Innei
 * @Date: 2020-05-01 19:35:56
 * @LastEditTime: 2020-08-14 09:09:37
 * @LastEditors: Innei
 * @FilePath: /mx-server/src/plugins/mailer/index.ts
 * @Coding with Love
 */

import { Link } from '@libs/db/models/link.model'
import { render } from 'ejs'
import { createTransport } from 'nodemailer'
import { renderGuestText } from './render/guest'
import { renderOwnerText } from './render/owner'

interface RenderProps {
  author: string
  ip?: string
  text: string
  link: string
  time: string
  mail: string
  title: string
  master?: string
}

export enum ReplyMailType {
  Owner,
  Guest,
}

export class Mailer {
  private mailer: ReturnType<typeof createTransport>
  constructor(
    private user: string,
    private pass: string,
    private options?: {
      name?: string
      port?: number
      host?: string
      service?: string
    },
  ) {
    this.mailer = createTransport({
      service: options?.service || 'qq',
      port: options?.port || 465,
      auth: { user, pass },
      secure: true,
    })
    this.options = options
  }
  private mailerOptions = {
    from: `"${this.options?.name || 'Mx Space'}" <${this.user}>`,
  }

  /**
   * Notification Link Apply (send to master)
   *
   */
  async sendLinkApplyEmail({
    to,
    model,
    authorName,
  }: {
    authorName: string
    to: string
    model: Link
  }) {
    await this.mailer.sendMail({
      ...this.mailerOptions,
      to,
      subject: `[${this.options?.name || 'Mx Space'}] 新的朋友 ${authorName}`,
      text: `来自 ${model.name} 的友链请求: 
        站点标题: ${model.name}
        站点网站: ${model.url}
        站点描述: ${model.description}
      `,
    })
  }
  async sendCommentNotificationMail({
    to,
    source,
    type,
  }: {
    to: string
    source: RenderProps
    type: ReplyMailType
  }) {
    if (type === ReplyMailType.Guest) {
      await this.mailer.sendMail({
        ...this.mailerOptions,
        ...{
          subject: `[${this.options?.name || 'Mx Space'}] 主人给你了新的回复呐`,
          to,
          html: this.render(renderGuestText, source),
        },
      })
    } else
      await this.mailer.sendMail({
        ...this.mailerOptions,
        ...{
          subject: `[${this.options?.name || 'Mx Space'}] 有新回复了耶~`,
          to,
          html: this.render(renderOwnerText, source),
        },
      })
  }

  render(template: string, source: RenderProps) {
    return render(template, {
      text: source.text,
      time: source.time,
      author: source.author,
      link: source.link,
      ip: source.ip || '',
      title: source.title,
      master: source.master,
      mail: source.mail,
    } as RenderProps)
  }

  getInstance() {
    return this.mailer
  }
}
