import * as fs from 'fs'
import * as path from 'path'

export class ParseMarkdownYAML {
  constructor(private basePath: string) {}

  async getFiles(): Promise<string[]> {
    const dir = await fs.promises.opendir(this.basePath)
    const files: string[] = []
    for await (const dirent of dir) {
      files.push(dirent.name)
    }
    // await dir.close()
    return files
  }

  async readFileAndParse(file: string) {
    const pwd = path.resolve(this.basePath, file)
    const raw = fs.readFileSync(pwd, { encoding: 'utf8' })
    // const parttenYAML = raw.matchAll(/---(.*?)---(.*)$/gs)
    const parts = /-{3,}\n(.*?)-{3,}\n*(.*)$/gms.exec(raw)
    if (!parts) {
      return { text: raw }
    }
    const parttenYAML = parts[1]
    const text = parts.pop()
    const parseYAML = parttenYAML.split('\n')

    const tags = [] as string[]
    const categories = [] as string[]

    let cur: 'cate' | 'tag' | null = null
    const meta: any = parseYAML.reduce((meta, current) => {
      const splitPart = current
        .trim()
        .split(':')
        .filter((item) => item.length)
      const sp =
        splitPart.length >= 2
          ? [
              splitPart[0],
              splitPart
                .slice(1)
                .filter((item) => item.length)
                .join(':')
                .trim(),
            ]
          : [splitPart[0]]

      // console.log(sp)
      if (sp.length === 2) {
        const [property, value] = sp
        if (['date', 'updated'].includes(property)) {
          meta[property] = new Date(value.trim())
        } else if (['categories:', 'tags:'].includes(property)) {
          cur = property === 'categories:' ? 'cate' : 'tag'
        } else meta[property] = value.trim()
      } else {
        const item = current.trim().replace(/^\s*-\s*/, '')

        if (['', 'tags:', 'categories:'].includes(item)) {
          cur = item === 'categories:' ? 'cate' : 'tag'
          return meta
        }
        if (cur === 'tag') {
          tags.push(item)
        } else {
          categories.push(item)
        }
      }
      return meta
    }, {})

    meta.categories = categories
    meta.tags = tags
    meta.slug = file.split('.').slice(0, -1).join('.')
    return { meta, text } as ParsedModel
  }

  async start() {
    const files = await this.getFiles()
    const contents = [] as ParsedModel[]
    for await (const file of files) {
      contents.push(await this.readFileAndParse(file))
    }
    return contents
  }
}

interface ParsedModel {
  meta?: {
    title: string
    updated: Date
    date: Date
    categories: Array<string>
    tags: Array<string>
    slug: string
  }
  text: string
}
