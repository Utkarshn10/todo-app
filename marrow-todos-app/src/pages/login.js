import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "@/utils/supabase";
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    const { user, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <div className="flex flex-col justify-center items-center h-4/5 border border-gray-300 rounded-lg p-20">
      <h1 className="text-3xl mb-4">Login</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-96">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <Button type="submit">Login</Button>
      </form>
      <p className="mt-4">Don't have an account? <Link href="/register" className="text-black underline">Register</Link></p>
    </div>
  );
} 