import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { useContainer } from 'class-validator'
import * as passport from 'passport'
import { AppModule } from 'src/app.module'
import * as supertest from 'supertest'

const username = `test-${Math.random().toString(16).slice(3, 5)}`

function generateUser() {
  return {
    username,
    mail: `test@gmail.com`,
    password: 'Pa$$w0rd',
  }
}

function getLoginResponseCallback(done: jest.DoneCallback) {
  return (err, resp: supertest.Response) => {
    if (err) {
      return done(err)
    }

    expect(resp.body).toBeDefined()
    expect(resp.body.token).toBeDefined()
    return done()
  }
}

function getResgisterResponseCallback(done: jest.DoneCallback) {
  return (err, resp: supertest.Response) => {
    if (err) {
      return done(err)
    }

    expect(resp.body).toBeDefined()
    expect(resp.body.token).toBeDefined()
    expect(resp.body.authCode).toBeDefined()
    expect(resp.body.username).toBeDefined()
    return done()
  }
}
console.log(process.env.NODE_ENV)
describe('AuthController (e2e)', () => {
  let app: INestApplication
  let request: supertest.SuperTest<supertest.Test>

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
    app.use(passport.initialize())
    app.use(passport.session())

    useContainer(app.select(AppModule), { fallbackOnErrors: true })

    await app.init()

    request = supertest(app.getHttpServer())
  })

  afterEach(async () => {
    await app.close()
  })

  it('should allow to sign up a new user', (done) => {
    request
      .post('/master/sign_up')
      .send(generateUser())
      .expect(HttpStatus.CREATED)
      .end(getResgisterResponseCallback(done))
  })

  it('should not allow to sign up with some username', (done) => {
    request
      .post('/master/sign_up')
      .send(generateUser())
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .end(() => done())
  })

  it('should allow to sign in an user', (done) => {
    request
      .post('/master/login')
      .send(generateUser())
      .expect(HttpStatus.OK)
      .end(getLoginResponseCallback(done))
  })
})
