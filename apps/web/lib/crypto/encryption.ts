import crypto from 'crypto'

// مفتاح التشفير (يجب أن يكون 32 بايت لـ AES-256)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16

export class EncryptionService {
  private encryptionKey: Buffer

  constructor() {
    // تحويل المفتاح إلى 32 بايت
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(ENCRYPTION_KEY)
      .digest()
  }

  // تشفير النص
  encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, this.encryptionKey, iv)
    
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const tag = cipher.getAuthTag()
    
    // دمج IV، النص المشفر، و Tag
    return iv.toString('hex') + encrypted + tag.toString('hex')
  }

  // فك تشفير النص
  decrypt(encryptedText: string): string {
    // استخراج الأجزاء
    const iv = Buffer.from(encryptedText.substring(0, IV_LENGTH * 2), 'hex')
    const tag = Buffer.from(encryptedText.substring(encryptedText.length - TAG_LENGTH * 2), 'hex')
    const encrypted = encryptedText.substring(IV_LENGTH * 2, encryptedText.length - TAG_LENGTH * 2)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, this.encryptionKey, iv)
    decipher.setAuthTag(tag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  }

  // تشفير البيانات
  encryptData(data: any): string {
    return this.encrypt(JSON.stringify(data))
  }

  // فك تشفير البيانات
  decryptData<T = any>(encryptedData: string): T {
    return JSON.parse(this.decrypt(encryptedData))
  }

  // إنشاء هاش آمن
  createHash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + ENCRYPTION_KEY)
      .digest('hex')
  }

  // إنشاء مفتاح عشوائي
  static generateKey(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // التحقق من صحة الهاش
  verifyHash(data: string, hash: string): boolean {
    const newHash = crypto
      .createHash('sha256')
      .update(data + ENCRYPTION_KEY)
      .digest('hex')
    
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(newHash))
  }
}

// خدمة JWT
export class JWTService {
  private jwtSecret: string

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || EncryptionService.generateKey(64)
  }

  // إنشاء توكن
  sign(payload: any, expiresIn: string = '7d'): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const expires = expiresIn === 'never' 
      ? now + (10 * 365 * 24 * 60 * 60) // 10 سنوات
      : now + this.parseExpiresIn(expiresIn)

    const data = {
      ...payload,
      iat: now,
      exp: expires,
      iss: 'bizai-factory',
      aud: 'bizai-users'
    }

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
    const encodedPayload = Buffer.from(JSON.stringify(data)).toString('base64url')
    
    const signature = crypto
      .createHmac('sha256', this.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  // التحقق من التوكن
  verify(token: string): any {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.')
      
      const expectedSignature = crypto
        .createHmac('sha256', this.jwtSecret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64url')

      if (!crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )) {
        throw new Error('Invalid signature')
      }

      const payload = JSON.parse(
        Buffer.from(encodedPayload, 'base64url').toString()
      )

      if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
      }

      return payload
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // تحديث التوكن
  refresh(token: string): string {
    const payload = this.verify(token)
    delete payload.iat
    delete payload.exp
    return this.sign(payload)
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1)
    const value = parseInt(expiresIn.slice(0, -1))

    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 60 * 60
      case 'd': return value * 24 * 60 * 60
      default: return 7 * 24 * 60 * 60 // 7 أيام افتراضياً
    }
  }

  // إنشاء توكنين (access و refresh)
  createTokenPair(userId: string, role: string = 'user') {
    const accessToken = this.sign(
      { userId, role, type: 'access' },
      '15m' // 15 دقيقة
    )
    
    const refreshToken = this.sign(
      { userId, role, type: 'refresh' },
      '7d' // 7 أيام
    )

    return { accessToken, refreshToken }
  }
}

// Middleware للتحقق من التوكن
export function verifyToken(req: Request): any {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  const token = authHeader.split(' ')[1]
  const jwtService = new JWTService()
  
  return jwtService.verify(token)
}

// Middleware للتحقق من الصلاحيات
export function requireRole(role: string) {
  return (req: Request) => {
    const payload = verifyToken(req)
    
    if (payload.role !== role && payload.role !== 'admin') {
      throw new Error('Insufficient permissions')
    }
    
    return payload
  }
}

// إنشاء خدمات مفردة
export const encryptionService = new EncryptionService()
export const jwtService = new JWTService()
