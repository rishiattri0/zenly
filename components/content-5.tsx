import { Cpu, Lock, Sparkles, Zap } from "lucide-react";

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32 scroll-mt-20" id="about">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <div className="mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Your well-being is our entire ecosystem.
          </h2>
          <p>
            We are more than just a tool. We provide a complete support system —
            from compassionate AI conversations to resources and techniques
            designed to guide you on your journey to better mental health.
          </p>
        </div>
        <img
          className="rounded-(--radius) grayscale"
          src="https://images.unsplash.com/photo-1616587226960-4a03badbe8bf?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="team image"
          height=""
          width=""
          loading="lazy"
        />

        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="size-4" />
              <h3 className="text-sm font-medium">Faaast</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Fast response to your needs so you don’t have to wait.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="size-4" />
              <h3 className="text-sm font-medium">Powerful</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Long chats supported for extra care and emotional support.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock className="size-4" />
              <h3 className="text-sm font-medium">Security</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your conversations are secure don’t worry.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4" />

              <h3 className="text-sm font-medium">AI Powered</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              A friendly AI chat-bot for u to express to.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
