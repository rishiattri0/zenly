import { Heart, Brain, Shield, Sparkles } from "lucide-react";

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32 scroll-mt-20" id="about">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
        <div className="mx-auto max-w-xl space-y-6 text-center md:space-y-12">
          <h2 className="text-balance text-4xl font-medium lg:text-5xl">
            Your mental wellness is our priority.
          </h2>
          <p>
            We're more than just an app. We provide a complete wellness ecosystem —
            from compassionate AI conversations to mood tracking and mindfulness tools
            designed to support your journey to emotional balance and inner peace.
          </p>
        </div>
        <div className="flex justify-center">
          <img
            className="rounded-(--radius)"
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="person practicing mindfulness and meditation"
            height=""
            width=""
            loading="lazy"
          />
        </div>

        <div className="relative mx-auto grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-8 lg:grid-cols-4 text-center ">
          <div className="space-y-3 ">
            <div className="flex items-center gap-2 justify-center">
              <Heart className="size-4" />
              <h3 className="text-sm font-medium">Compassionate</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Empathetic AI companions that listen and respond with care.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Brain className="size-4" />
              <h3 className="text-sm font-medium">Insightful</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Advanced mood tracking to understand your emotional patterns.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Shield className="size-4" />
              <h3 className="text-sm font-medium">Private</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Your wellness data is protected with complete confidentiality.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 justify-center">
              <Sparkles className="size-4" />
              <h3 className="text-sm font-medium">Mindful</h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Thoughtfully designed tools for your mental wellness journey.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
