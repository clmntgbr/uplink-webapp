"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { login } from "@/lib/auth/api"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { type ComponentProps, useState } from "react"
import { toast } from "sonner"

type FormSubmitHandler = ComponentProps<"form">["onSubmit"]

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("clement@gmail.com")
  const [password, setPassword] = useState("z0v9!xKEolvZkBZn")

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await login({ email, password })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
          <CardAction></CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="pl-8"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="********"
                  autoComplete="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-8"
                />
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">
                  {isLoading ? (
                    <>
                      <Spinner />
                      Sign in
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
                <Button variant="outline" type="button" asChild>
                  <Link href="/register">Create an account</Link>
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
