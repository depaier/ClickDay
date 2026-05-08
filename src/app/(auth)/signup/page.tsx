import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function SignupPage() {
  return (
    <div className="w-full max-w-md p-8 bg-[#111] border border-white/10 rounded-sm">
      <h1 className="text-2xl font-heading tracking-[0.2em] mb-2 text-center uppercase">Create Account</h1>
      <p className="text-gray-400 text-sm text-center mb-8">Join the ClickDay community</p>

      <form className="flex flex-col gap-6">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Username</label>
          <Input variant="onDark" type="text" placeholder="@username" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Email</label>
          <Input variant="onDark" type="email" placeholder="your@email.com" />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">Password</label>
          <Input variant="onDark" type="password" placeholder="••••••••" />
        </div>

        <Button variant="accent" className="w-full mt-4 h-12 text-sm">
          Sign Up
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
