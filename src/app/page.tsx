import { Shield, Eye, Lock, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Eye,
    title: "Full Visibility",
    description:
      "See exactly what scopes each connected service has, when they were granted, and when last used.",
  },
  {
    icon: Lock,
    title: "Scoped Access",
    description:
      "AI agents only get the minimum permissions needed. Read-only by default. No surprises.",
  },
  {
    icon: ScrollText,
    title: "Complete Audit Trail",
    description:
      "Every API call your AI agent makes is logged with timestamp, scope used, and result.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-semibold">ScopeGuard</span>
          </div>
          <a href="/auth/login">
            <Button>Sign In</Button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            Permission Control
            <br />
            for AI Agents
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Know exactly what your AI agents can access and what they did access.
            Connect GitHub, Google Calendar, and Gmail with scoped, auditable,
            revocable permissions.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <a href="/auth/login">
              <Button size="lg">Get Started</Button>
            </a>
            <a href="#features">
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </a>
          </div>
        </section>

        <section id="features" className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Security you can see
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardContent className="pt-6">
                    <feature.icon className="mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 text-xl font-semibold">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold">Built with Auth0 Token Vault</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Credentials are managed by Auth0. Your AI agent never sees your
              passwords, refresh tokens, or API keys. Only scoped, short-lived
              access tokens.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Built by BrainAI Agency for the Auth0 &quot;Authorized to Act&quot; Hackathon</p>
      </footer>
    </div>
  );
}
