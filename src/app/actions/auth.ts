'use server'

import { signIn } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { AuthError } from 'next-auth'

export async function loginAction(prevState: unknown, formData: FormData) {
  try {
    await signIn('credentials', {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      redirect: false,
    })
    return { success: true, error: '' }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: '邮箱或密码错误' }
    }
    throw error
  }
}

export async function registerAction(prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: '请填写所有字段' }
  }

  if (password.length < 6) {
    return { success: false, error: '密码至少6位' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { success: false, error: '该邮箱已注册' }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.user.create({
    data: { email, passwordHash },
  })

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    return { success: true, error: '' }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: '注册成功，请登录' }
    }
    throw error
  }
}
