import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee";

const testimonials = [
  {
    quote:
      "I use Zenly when anxiety spikes late at night. The chat helps me slow down, and the breathing prompts actually pull me out of panic mode.",
    name: "A. Rivera",
    role: "Graduate Student",
    initials: "AR",
  },
  {
    quote:
      "The mood tracker showed that my stress climbs on Sundays. Once I saw the pattern, I planned my week better and my sleep improved.",
    name: "M. Johnson",
    role: "Product Manager",
    initials: "MJ",
  },
  {
    quote:
      "Journaling plus AI reflection gives me language for what I feel. I walk into therapy sessions way more prepared now.",
    name: "K. Patel",
    role: "Therapy Client",
    initials: "KP",
  },
  {
    quote:
      "I recommend Zenly between appointments. It is not a replacement for therapy, but it keeps clients engaged with their coping tools.",
    name: "Dr. L. Chen",
    role: "Licensed Counselor",
    initials: "LC",
  },
  {
    quote:
      "The daily check-ins gave me structure when I felt overwhelmed. Small consistent steps made my mood more stable across the month.",
    name: "T. Brooks",
    role: "Founder",
    initials: "TB",
  },
  {
    quote:
      "I like that it feels private and judgment-free. I can reflect honestly, then share key notes with my therapist during sessions.",
    name: "N. Ali",
    role: "Software Engineer",
    initials: "NA",
  },
];

function TestimonialCard({
  quote,
  name,
  role,
  initials,
}: {
  quote: string;
  name: string;
  role: string;
  initials: string;
}) {
  return (
    <Card className="w-[320px] border-border/60 bg-card/80 backdrop-blur-sm sm:w-[360px]">
      <CardHeader className="pb-2">
        <div className="text-sm font-medium text-primary">User Story</div>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        <blockquote className="text-sm leading-relaxed">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Avatar className="size-10">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <cite className="text-sm font-medium not-italic">{name}</cite>
            <span className="text-muted-foreground block text-xs">{role}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Testimonials() {
  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(3);

  return (
    <section className="py-16 md:py-28" id="testimonials">
      <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-14">
        <div className="relative z-10 mx-auto max-w-2xl space-y-4 text-center">
          <h2 className="text-4xl font-medium lg:text-5xl">
            Trusted for everyday mental wellness support
          </h2>
          <p className="text-muted-foreground">
            Real feedback from people using Zenly for anxiety support, mood awareness,
            reflection, and consistent care between therapy sessions.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background/40 p-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-background to-transparent" />

          <Marquee pauseOnHover className="[--duration:36s] py-2">
            {firstRow.map((item) => (
              <TestimonialCard key={`${item.name}-${item.role}`} {...item} />
            ))}
          </Marquee>
          <Marquee pauseOnHover reverse className="[--duration:40s] py-2">
            {secondRow.map((item) => (
              <TestimonialCard key={`${item.name}-${item.role}`} {...item} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
