"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const json = await res.json();

      if (res.ok) {
        toast.success("Account created successfully");
        router.push("/login");
      } else {
        toast.error(json.error?.message || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold tracking-[0.3em] uppercase">
            ZFR
          </Link>
          <h1 className="text-lg font-medium mt-6 tracking-wide">CREATE ACCOUNT</h1>
          <p className="text-sm text-muted-foreground mt-2">Join us and enjoy exclusive benefits.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs tracking-wider">FULL NAME</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-none border-border focus:border-foreground"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs tracking-wider">EMAIL</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-none border-border focus:border-foreground"
              placeholder="your@email.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs tracking-wider">PASSWORD</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-none border-border focus:border-foreground"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-xs tracking-wider">CONFIRM PASSWORD</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-none border-border focus:border-foreground"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white text-xs font-medium tracking-[0.2em] py-4 hover:bg-black/90 transition-colors disabled:opacity-50"
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline hover:no-underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
