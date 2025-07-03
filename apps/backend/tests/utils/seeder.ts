import { db } from '@/db/client'

const rawUsers = [
  {
    id: 'admin',
    name: 'Admin',
    email: 'admin@ls.local',
    role: 'admin',
  },
  {
    id: 'user',
    name: 'User',
    email: 'user@ls.local',
    role: 'user',
  },
]

export async function seed() {
  await db.execute(`
    -- DML for users table
    INSERT INTO "users" ("id", "name", "email", "email_verified", "role", "created_at", "updated_at") VALUES
    ${rawUsers.map((user) => `('${user.id}', '${user.name}', '${user.email}', FALSE, '${user.role}', NOW(), NOW())`).join(',')};
  `)

  // Hashing password is expensive >:(
  // The password is "password"
  await db.execute(`
    -- DML for accounts table
    INSERT INTO "accounts" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at") VALUES
    ('KJLyP9f0qeDi10gp_IBn2', 'admin', 'credential', 'admin', 'da5587e7dd97c704c776914322eb8d8d:3c59aab3990d1c1d603563146c75fb7c8a0ff16ef9ca044ed7d512f3d25f53bc1412df7e1fadb0a485eb5a6d456fb3e2f201a695874e7583755ddae3470fe308', NOW(), NOW()),
    ('qKrIiCnRYl5PDSvujFpc4', 'user', 'credential', 'user', 'da5587e7dd97c704c776914322eb8d8d:3c59aab3990d1c1d603563146c75fb7c8a0ff16ef9ca044ed7d512f3d25f53bc1412df7e1fadb0a485eb5a6d456fb3e2f201a695874e7583755ddae3470fe308', NOW(), NOW());
  `)
}
