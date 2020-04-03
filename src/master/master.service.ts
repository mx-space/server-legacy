import { User } from '@libs/db/models/user.model'
import { Injectable, UnprocessableEntityException } from '@nestjs/common'
import { ReturnModelType, DocumentType } from '@typegoose/typegoose'
import { InjectModel } from 'nestjs-typegoose'
import { AuthService } from 'src/auth/auth.service'
import { nanoid } from 'nanoid'
import { compareSync } from 'bcrypt'

@Injectable()
export default class MasterService {
  constructor(
    @InjectModel(User) private readonly userModel: ReturnModelType<typeof User>,
    private readonly authService: AuthService,
  ) {}

  async getMasterInfo() {
    return await this.userModel.findOne()
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

  async patchData(user: DocumentType<User>, data: Partial<User>) {
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
}
