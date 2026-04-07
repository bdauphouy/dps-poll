"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLogin() {
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        setCountdown(60);
        setTimeout(() => otpInputRef.current?.focus(), 100);
      } else {
        setError(data.error || "Failed to send code");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpValue(value);

    // Auto-submit when 6 digits
    if (value.length === 6) {
      handleOtpSubmit(value);
    }
  };

  const handleOtpSubmit = async (code?: string) => {
    const otpCode = code || otpValue;
    if (otpCode.length !== 6) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        const data = await response.json();
        setError(data.error || "Invalid code");
        setOtpValue("");
        otpInputRef.current?.focus();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setCountdown(60);
        setOtpValue("");
        otpInputRef.current?.focus();
      }
    } catch {
      setError("Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[360px]">
        <div className="bg-card rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-7 h-7 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {step === "email" ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                )}
              </svg>
            </div>
            <h1 className="text-xl font-bold">
              {step === "email" ? "Dashboard access" : "Enter code"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {step === "email"
                ? "Enter your email to receive a login code"
                : `We sent a code to ${email}`}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[15px] font-medium mb-2"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 bg-secondary rounded-xl text-base outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 rounded-xl">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-[15px] font-medium text-white bg-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Send code"
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-[15px] font-medium mb-3 text-center"
                >
                  Enter 6-digit code
                </label>

                <input
                  ref={otpInputRef}
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  value={otpValue}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full h-14 text-center text-[24px] font-bold tracking-[0.4em] bg-secondary rounded-xl outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/40"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 rounded-xl">
                  <p className="text-destructive text-sm text-center">{error}</p>
                </div>
              )}

              <button
                onClick={() => handleOtpSubmit()}
                disabled={isLoading || otpValue.length !== 6}
                className="w-full h-11 text-[15px] font-medium text-white bg-primary rounded-xl cursor-pointer hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  onClick={() => {
                    setStep("email");
                    setOtpValue("");
                    setError(null);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Change email
                </button>
                <button
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className="text-primary disabled:text-muted-foreground cursor-pointer disabled:cursor-not-allowed"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-muted-foreground text-sm mt-5">
            <a href="/" className="text-primary hover:underline">
              Back to survey
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
