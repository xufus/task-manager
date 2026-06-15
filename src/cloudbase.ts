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
}

// SDK 不同接口返回的 user 形态略有差异，这里宽松取字段，避免类型耦合。
function pickUsername(u: any): string {
  return (u && (u.username || u.name || u.nickName)) || ''
}

/** 用户名+密码注册；注册成功通常会自动建立会话，否则补登一次。 */
export async function register(username: string, password: string): Promise<AuthUser> {
  const res = await auth.signUp({ username, password })
  if (res.error) throw new Error(res.error.message || '注册失败')
  if (!res.data?.session) return login(username, password)
  return { uid: (res.data?.user as any)?.id, username }
}

/** 用户名+密码登录。 */
export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await auth.signInWithPassword({ username, password })
  if (res.error) throw new Error(res.error.message || '登录失败')
  return { uid: (res.data?.user as any)?.id, username }
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
