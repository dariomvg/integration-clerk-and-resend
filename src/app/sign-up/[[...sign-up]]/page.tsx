import { SignUp } from "@clerk/nextjs";


export default function PageSignUp() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <SignUp />
    </main>
  );
}
