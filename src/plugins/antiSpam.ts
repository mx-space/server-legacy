import { client, AkismetClient } from 'akismet'

export class SpamCheck {
  private akismet: AkismetClient
  constructor({ blog, apiKey }: { blog: string; apiKey: string }) {
    this.akismet = client({
      blog,
      apiKey,
    })
  }
  private verifyKey() {
    return new Promise((resolve, reject) => {
      this.akismet.verifyKey(function (err, verified) {
        if (err) {
          reject(err)
        }
        if (verified) resolve(true)
        else resolve(false)
      })
    })
  }
  isSpam({
    ip,
    url,
    author,
    content,
  }: {
    ip: string
    url?: string
    author: string
    content: string
  }) {
    return new Promise(async (resolve, reject) => {
      if (!(await this.verifyKey())) {
        reject('key outdate')
      }
      this.akismet.checkComment(
        {
          user_ip: ip,
          permalink: url || '',
          comment_author: author,
          comment_content: content,
        },
        function (err, spam) {
          if (err) {
            return reject(err)
          }
          if (spam) resolve(true)
          else resolve(false)
        },
      )
    })
  }
}
