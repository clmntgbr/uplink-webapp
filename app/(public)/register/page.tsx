"use client";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { register } from "@/lib/auth/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";
import { toast } from "sonner";

type FormSubmitHandler = ComponentProps<"form">["onSubmit"];

export default function RegisterPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: FormSubmitHandler = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const firstname = formData.get("firstname") as string;
    const lastname = formData.get("lastname") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      await register({ email, password, confirmPassword, firstname, lastname });
      toast.success("Account created successfully");
      router.push("/login");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto my-auto h-full">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Fill in the form below to create your account</CardDescription>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field orientation="horizontal">
              <Field>
                <FieldLabel htmlFor="firstname">First name</FieldLabel>
                <Input id="firstname" name="firstname" type="text" placeholder="John" autoComplete="given-name" required disabled={isLoading} />
              </Field>
              <Field>
                <FieldLabel htmlFor="lastname">Last name</FieldLabel>
                <Input id="lastname" name="lastname" type="text" placeholder="Doe" autoComplete="family-name" required disabled={isLoading} />
              </Field>
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required disabled={isLoading} />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" name="password" type="password" placeholder="********" autoComplete="new-password" required disabled={isLoading} />
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="********"
                autoComplete="new-password"
                required
                disabled={isLoading}
              />
            </Field>
            <Field orientation="horizontal">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>
              <Button variant="outline" type="button" asChild>
                <Link href="/login">Already have an account?</Link>
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
