import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { NavLink, useNavigate } from 'react-router'
import { z } from 'zod/v4'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { authClient } from '@/lib/auth-client'

const signUpSchema = z.object({
  name: z.string().nonempty(),
  email: z.email(),
  password: z.string().min(8),
})

type SignUpSchema = z.infer<typeof signUpSchema>

function SignUpForm() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: SignUpSchema) => {
    setLoading(true)

    const result = await authClient.signUp.email({
      name: values.name,
      email: values.email,
      password: values.password,
    })

    if (!result.error) {
      navigate('/')
      return
    }

    form.setError('email', { message: result.error.message })
    setLoading(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="user@ls.local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} type="submit" className="w-full">
          Sign up
        </Button>
      </form>
    </Form>
  )
}

export default function SignUp() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <h1>Sign up</h1>
          </CardTitle>
          <CardDescription>Enter your information below to sign up</CardDescription>
        </CardHeader>
        <CardContent>
          <SignUpForm />

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <NavLink to="/auth/login" className="underline underline-offset-4">
              Login
            </NavLink>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
