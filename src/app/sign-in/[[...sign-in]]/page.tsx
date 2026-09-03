import { SignIn } from "@clerk/nextjs";

export default function PageSignIn() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <SignIn />
    </main>
  );
}
