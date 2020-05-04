import { User } from '@libs/db/models/user.model'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { AuthService } from 'src/auth/auth.service'
import { nanoid } from 'nanoid'
import { compareSync } from 'bcrypt'
import { getAvatar } from 'src/shared/utils'

@Injectable()
export default class MasterService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    private readonly authService: AuthService,
  ) {}

  async getMasterInfo() {
    const user = await this.userModel.findOne().select('-authCode').lean()
    const avatar = user.avatar ?? getAvatar(user.mail)
    return { ...user, avatar }
  }

  async createMaster(model: User) {
    const hasMaster = await this.userModel.countDocuments()
    // 禁止注册两个以上账户
    if (hasMaster) {
      throw new UnprocessableEntityException('我已经有一个主人了哦')
    }
    const authCode = nanoid(10)
    const res = await this.userModel.create({ ...model, authCode })
    const token = await this.authService.signToken(res._id)
    return { token, username: res.username, authCode: res.authCode }
  }

  /**
   * 修改密码
   *
   * @async
   * @param {DocumentType} user - 用户查询结果, 已经挂载在 req.user
   * @param {Partial} data - 部分修改数据
   */
  async patchUserData(user: DocumentType<User>, data: Partial<User>) {
    const { password } = data
    const doc = { ...data }
    if (password !== undefined) {
      const { _id } = user
      const currentUser = await this.userModel
        .findById(_id)
        .select('+password +apiToken')
      // 1. 验证新旧密码是否一致
      const isSamePassword = compareSync(password, currentUser.password)
      if (isSamePassword) {
        throw new UnprocessableEntityException('密码可不能和原来的一样哦')
      }

      // 2. 认证码重新生成
      const newCode = nanoid(10)
      doc.authCode = newCode
    }
    return await this.userModel
      .updateOne({ _id: user._id }, doc)
      .setOptions({ omitUndefined: true })
  }

  /**
   * 记录登陆的足迹(ip, 时间)
   *
   * @async
   * @param {string} ip - string
   * @return {Promise<Record<string, Date|string>>} 返回上次足迹
   */
  async recordFootstep(ip: string): Promise<Record<string, Date | string>> {
    const master = await this.userModel.findOne()
    const PrevFootstep = {
      lastLoginTime: master.lastLoginTime || new Date(1586090559569),
      lastLoginIp: master.lastLoginIp || null,
    }
    await master.updateOne({
      lastLoginTime: new Date(),
      lastLoginIp: ip,
    })

    return PrevFootstep
  }
}
