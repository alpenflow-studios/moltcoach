"use client";

import { usePrivy } from "@privy-io/react-auth";

export function EmailSignupLink() {
  const { login } = usePrivy();

  return (
    <button
      type="button"
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      onClick={() => login({ loginMethods: ["email"] })}
    >
      Sign up with your email
    </button>
  );
}
