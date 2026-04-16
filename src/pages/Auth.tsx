import { FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

type AuthMode = "signin" | "signup";

type LocationState = {
  from?: string;
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [error, setError] = useState<string | null>(null);

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const destination = ((location.state as LocationState | null)?.from ?? "/dashboard") as string;

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const result = signIn({
      email: signInEmail,
      password: signInPassword,
    });

    if (!result.ok) {
      setError(result.error ?? "Unable to sign in.");
      return;
    }

    navigate(destination, { replace: true });
  };

  const handleSignUp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const result = signUp({
      fullName: signUpName,
      email: signUpEmail,
      password: signUpPassword,
    });

    if (!result.ok) {
      setError(result.error ?? "Unable to create account.");
      return;
    }

    navigate(destination, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Bot className="h-7 w-7 text-primary" />
          </div>
          <CardTitle>{mode === "signin" ? "Welcome back" : "Create your account"}</CardTitle>
          <CardDescription>
            {mode === "signin"
              ? "Sign in to access the RoboControl dashboard."
              : "Sign up to start using RoboControl."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {mode === "signin" ? (
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  autoComplete="email"
                  value={signInEmail}
                  onChange={(event) => setSignInEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  autoComplete="current-password"
                  value={signInPassword}
                  onChange={(event) => setSignInPassword(event.target.value)}
                  required
                />
              </div>

              <Button className="w-full" type="submit">
                Sign In
              </Button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div className="space-y-2">
                <Label htmlFor="signup-name">Full name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  value={signUpName}
                  onChange={(event) => setSignUpName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={signUpEmail}
                  onChange={(event) => setSignUpEmail(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  autoComplete="new-password"
                  value={signUpPassword}
                  onChange={(event) => setSignUpPassword(event.target.value)}
                  required
                />
              </div>

              <Button className="w-full" type="submit">
                Create Account
              </Button>
            </form>
          )}

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
            <Button
              type="button"
              variant="link"
              className="pl-2"
              onClick={() => {
                setError(null);
                setMode(mode === "signin" ? "signup" : "signin");
              }}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
