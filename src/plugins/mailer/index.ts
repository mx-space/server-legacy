import { createTransport } from 'nodeMailer'
import { render } from 'ejs'
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
    })
  }
  private mailerOptions = {
    from: `"${this.options?.name || 'Mx Space'}" <${this.user}>`,
  }

  async send({
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
          subject: `[${source.author}] 主人给你了新的回复呐`,
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
}
