import cloudbase from '@cloudbase/js-sdk'

// 环境 ID 不是机密信息（前端代码本来就会带它），可放进代码或环境变量。
// 优先读取 VITE_ 环境变量，方便在 Vercel 上配置；缺省时回退到本项目的环境 ID，
// 这样即使忘了配环境变量也能正常运行。
const ENV_ID =
  (import.meta.env.VITE_CLOUDBASE_ENV_ID as string | undefined) ||
  'task-manager-d0ghsia6r18225d3b'

export const app = cloudbase.init({ env: ENV_ID })
// persistence: 'local' —— 登录态写入 localStorage，刷新/重开浏览器后仍保持登录。
export const auth = app.auth({ persistence: 'local' })
export const db = app.database()

export interface AuthUser {
  uid?: string
  username: string
  email?: string
}

// SDK 不同接口返回的 user 形态略有差异，这里宽松取字段，避免类型耦合。
function pickUsername(u: any): string {
  return (u && (u.username || u.email || u.name || u.nickName)) || ''
}

/**
 * 注册第 1 步：向邮箱发送验证码（本环境强制邮箱验证码，不能免）。
 * 返回 verificationId（第 2 步要带上）与 isUser（邮箱是否已注册，用于提示去登录）。
 */
export async function sendEmailCode(email: string): Promise<{ verificationId: string; isUser: boolean }> {
  const res: any = await auth.getVerification({ email })
  const verificationId = res?.verification_id
  if (!verificationId) throw new Error('验证码发送失败，请稍后重试')
  return { verificationId, isUser: !!res?.is_user }
}

/**
 * 注册第 2 步：校验验证码并以邮箱+密码注册。
 * 成功后通常已建立会话，否则补登一次。
 */
export async function registerWithCode(
  email: string,
  password: string,
  verificationId: string,
  code: string,
): Promise<AuthUser> {
  const verifyRes: any = await auth.verify({ verification_id: verificationId, verification_code: code })
  const verification_token = verifyRes?.verification_token
  if (!verification_token) throw new Error('验证码校验失败')
  const res = await auth.signUp({ email, password, verification_code: code, verification_token })
  if (res.error) throw new Error(res.error.message || '注册失败')
  if (!res.data?.session) return login(email, password)
  return { uid: (res.data?.user as any)?.id, username: email, email }
}

/** 账号+密码登录：含 @ 视为邮箱，否则按用户名（兼容控制台手动建的用户名账号）。 */
export async function login(account: string, password: string): Promise<AuthUser> {
  const isEmail = account.includes('@')
  const res = await auth.signInWithPassword(
    isEmail ? { email: account, password } : { username: account, password },
  )
  if (res.error) throw new Error(res.error.message || '登录失败')
  return { uid: (res.data?.user as any)?.id, username: account, email: isEmail ? account : undefined }
}

/** 退出登录。 */
export async function logout(): Promise<void> {
  await auth.signOut()
}

/** 读取当前登录态（刷新后用它恢复会话）。返回 null 表示未登录。 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const state: any = await auth.getLoginState()
    const u = state?.user
    if (!u) return null
    return { uid: u.uid || u.id, username: pickUsername(u) }
  } catch {
    return null
  }
}

// ---- 云数据库读写 ----
// 前端 get() 单次最多返回 100 条，这里分页取全量。
const PAGE = 100

/** 取出某集合（当前登录账号可见）的全部文档，并剥掉云端内部字段。 */
export async function listAll(collection: string): Promise<any[]> {
  const out: any[] = []
  let skip = 0
  for (;;) {
    const res: any = await db.collection(collection).skip(skip).limit(PAGE).get()
    const batch: any[] = res?.data || []
    out.push(...batch)
    if (batch.length < PAGE) break
    skip += PAGE
  }
  return out.map((d) => {
    const clean = { ...d }
    delete clean._id
    delete clean._openid
    return clean
  })
}

/** 以指定 id 写入/覆盖一条文档（id 即文档 _id）。 */
export async function putDoc(collection: string, id: string, data: any): Promise<void> {
  await db.collection(collection).doc(id).set(data)
}

/** 局部更新一条文档。 */
export async function patchDoc(collection: string, id: string, partial: any): Promise<void> {
  await db.collection(collection).doc(id).update(partial)
}

/** 删除一条文档。 */
export async function delDoc(collection: string, id: string): Promise<void> {
  await db.collection(collection).doc(id).remove()
}
