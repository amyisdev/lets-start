import { z } from "zod"

export const UserProfileSchema = z.object({
  displayName: z.string().nullable(),
  bio: z.string().max(160).nullable(),
  avatarUrl: z.string().url().nullable(),
})

export type UserProfile = z.infer<typeof UserProfileSchema>

export const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  bio: z.string().max(160).optional(),
  avatarUrl: z.string().url().optional(),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
