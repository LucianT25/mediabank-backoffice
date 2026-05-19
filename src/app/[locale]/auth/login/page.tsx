import { LoginForm } from "@/components/blocks/auth/login-form"
import GoogleAuthWrapper from "@/components/google-auth-wrapper";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const search = await searchParams

  return (
      <GoogleAuthWrapper>
        <LoginForm callbackUrl={search.callbackUrl as string} />
      </GoogleAuthWrapper>
  )
}
