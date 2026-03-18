import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Shield className="mb-4 h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <a href="/" className="mt-6">
        <Button>Go Home</Button>
      </a>
    </div>
  );
}
