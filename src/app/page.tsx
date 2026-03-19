import { Shield, Eye, Lock, ScrollText, ArrowRight, Fingerprint, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Eye,
    title: "Full Visibility",
    description:
      "See exactly what scopes each connected service has, when they were granted, and when last used.",
    color: "from-blue-500/20 to-indigo-500/20",
    iconColor: "text-blue-600",
  },
  {
    icon: Lock,
    title: "Scoped Access",
    description:
      "AI agents only get the minimum permissions needed. Read-only by default. No surprises.",
    color: "from-indigo-500/20 to-violet-500/20",
    iconColor: "text-indigo-600",
  },
  {
    icon: ScrollText,
    title: "Complete Audit Trail",
    description:
      "Every API call your AI agent makes is logged with timestamp, scope used, and result.",
    color: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-600",
  },
];

const capabilities = [
  { icon: Fingerprint, label: "Auth0 Token Vault" },
  { icon: Shield, label: "Scoped Permissions" },
  { icon: Zap, label: "Real-time Audit" },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="relative z-10 border-b border-indigo-100/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600">
              <Shield className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ScopeGuard</span>
          </div>
          <a href="/auth/login">
            <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700">
              Sign In
            </Button>
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white" />
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.45_0.2_265/0.04)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.45_0.2_265/0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
          {/* Radial glow */}
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 bg-gradient-to-b from-indigo-400/15 via-violet-400/10 to-transparent blur-3xl" />

          <div className="relative container mx-auto px-6 pb-20 pt-24 text-center md:pb-28 md:pt-32">
            <Badge variant="secondary" className="mb-6 border-indigo-200/50 bg-indigo-50 px-4 py-1.5 text-indigo-700">
              Built with Auth0 Token Vault
            </Badge>

            <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              Permission Control{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                for AI Agents
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              Know exactly what your AI agents can access and what they did access.
              Connect GitHub, Google Calendar, and Gmail with scoped, auditable,
              revocable permissions.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="/auth/login">
                <Button size="lg" className="h-12 bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href="#features">
                <Button size="lg" variant="outline" className="h-12 border-indigo-200 px-8 text-base hover:bg-indigo-50">
                  Learn More
                </Button>
              </a>
            </div>

            {/* Capability badges */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              {capabilities.map((cap) => (
                <div key={cap.label} className="flex items-center gap-2">
                  <cap.icon className="h-4 w-4 text-indigo-500" />
                  <span>{cap.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t py-24">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4 border-indigo-200/50 bg-indigo-50 px-3 py-1 text-indigo-700">
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Security you can see
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Every permission granted, every action taken, every scope used. Full transparency for AI agent access.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="group relative overflow-hidden border-0 shadow-lg shadow-indigo-500/5 transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-0.5">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                  <CardContent className="relative pt-8 pb-8">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} ${feature.iconColor}`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-3 text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t bg-gradient-to-b from-indigo-50/50 to-white py-24">
          <div className="container mx-auto px-6 text-center">
            <Badge variant="secondary" className="mb-4 border-indigo-200/50 bg-indigo-50 px-3 py-1 text-indigo-700">
              How It Works
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Built with Auth0 Token Vault
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Credentials are managed by Auth0. Your AI agent never sees your
              passwords, refresh tokens, or API keys. Only scoped, short-lived
              access tokens.
            </p>

            <div className="mx-auto mt-14 grid max-w-3xl gap-8 md:grid-cols-3">
              {[
                { step: "1", title: "Connect", desc: "Link your GitHub, Calendar, or Gmail through Auth0's secure OAuth flow." },
                { step: "2", title: "Scope", desc: "AI gets only read-only access to exactly what it needs. Nothing more." },
                { step: "3", title: "Audit", desc: "Every API call is logged. See what was accessed, when, and the result." },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-bold text-white shadow-md shadow-indigo-500/25">
                    {item.step}
                  </div>
                  <h3 className="mb-2 font-semibold">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to control your AI agents?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Take full control over what your AI agents can access.
              Free to use, open source.
            </p>
            <a href="/auth/login" className="mt-8 inline-block">
              <Button size="lg" className="h-12 bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-base text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-700 hover:to-violet-700">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center gap-2.5 mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-violet-600">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-foreground">ScopeGuard</span>
          </div>
          <p>Built by BrainAI Agency for the Auth0 &quot;Authorized to Act&quot; Hackathon</p>
        </div>
      </footer>
    </div>
  );
}
