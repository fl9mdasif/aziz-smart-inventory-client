"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "@/redux/api/authApi";
import { loginSchema } from "@/utils/interface";
import { storeUserInfo } from "@/services/auth.services";
import { LogoMark } from "@/components/public/LogoMark";
import { BUSINESS } from "@/components/public/PublicHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const res = await login(values).unwrap();
      const accessToken = res?.accessToken;
      if (!accessToken) {
        throw new Error("No access token returned");
      }
      storeUserInfo({ accessToken });
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (err) {
      const message =
        (err as { data?: string })?.data || "Invalid email or password";
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Same two-tone mesh gradient as the homepage hero, for brand continuity. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(55% 45% at 15% 10%, color-mix(in oklch, var(--primary), transparent 78%) 0%, transparent 65%), " +
            "radial-gradient(50% 45% at 90% 15%, color-mix(in oklch, oklch(0.6 0.1 195), transparent 82%) 0%, transparent 65%), " +
            "radial-gradient(60% 40% at 50% 100%, color-mix(in oklch, var(--primary), transparent 88%) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-sm"
      >
        <Link href="/" className="mb-6 flex items-center justify-center gap-2.5">
          <LogoMark />
          <span className="text-sm font-semibold">{BUSINESS.name}</span>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <p className="text-sm text-muted-foreground">Staff &amp; admin dashboard</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="pr-9"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              {serverError && <p className="text-sm text-destructive">{serverError}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Back to homepage
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
