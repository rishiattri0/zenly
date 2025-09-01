import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Sarah J.",
    role: "College Student",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    quote:
      "I was hesitant to talk to anyone about my anxiety. This chatbot provided a judgment-free space to untangle my thoughts. It feels like a first step I can actually take.",
  },
  {
    name: "David Chen",
    role: "Graphic Designer",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    quote:
      "The breathing exercises and grounding techniques suggested by the AI have been a game-changer for my panic attacks at work. It’s like having a tool in my pocket.",
  },
  {
    name: "Maya R.",
    role: "Teacher",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    quote:
      "As someone who can't afford traditional therapy right now, this has been a lifeline. It helps me process my day and reframe negative thoughts before bed.",
  },
  {
    name: "Anonymous",
    role: "Veteran",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    quote:
      "Talking about PTSD is hard. I don’t feel pressured here. I can go at my own pace, and the resources it pointed me to were actually helpful.",
  },
  {
    name: "James K.",
    role: "Remote Worker",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    quote:
      "The daily check-ins keep me accountable for my mood. I didn’t realize how much I was ignoring my own stress until I started logging it here.",
  },
  {
    name: "Elena M.",
    role: "Nurse",
    image: "https://randomuser.me/api/portraits/women/7.jpg",
    quote:
      "After 12-hour shifts, my brain is full. This bot helps me decompress and practice mindfulness in just a few minutes. It’s incredible for burnout prevention.",
  },
  {
    name: "Alex P.",
    role: "Parent",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    quote:
      "It’s available at 2 AM when I’m overwhelmed and can’t sleep. Having immediate, calming strategies makes all the difference.",
  },
  {
    name: "Priya T.",
    role: "Software Engineer",
    image: "https://randomuser.me/api/portraits/women/9.jpg",
    quote:
      "The CBT-based prompts are fantastic. It doesn’t just listen; it actively helps me challenge and change my thinking patterns in a structured way.",
  },
  {
    name: "Marcus D.",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/10.jpg",
    quote:
      "I use it to practice conversations and manage social anxiety. It’s a safe sandbox to build my confidence without any fear of judgment.",
  },
  {
    name: "Sophie L.",
    role: "Graduate Student",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    quote:
      "It helped me identify the difference between everyday stress and something I needed more help with. It gave me the courage to seek a therapist.",
  },
  // New testimonials start here
  {
    name: "Chloe B.",
    role: "Artist",
    image: "https://randomuser.me/api/portraits/women/14.jpg",
    quote:
      "During a deep depressive episode, the gentle, persistent check-ins were the only thing that made me feel seen. It didn’t try to fix me, just stayed with me. That meant everything.",
  },
  {
    name: "Ryan G.",
    role: "HR Manager",
    image: "https://randomuser.me/api/portraits/men/15.jpg",
    quote:
      "I recommend this to our employees as part of our wellness program. It’s incredible for managing work-related stress and building emotional resilience in a private, personal way.",
  },
];
const chunkArray = (
  array: Testimonial[],
  chunkSize: number
): Testimonial[][] => {
  const result: Testimonial[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const testimonialChunks = chunkArray(
  testimonials,
  Math.ceil(testimonials.length / 3)
);

export default function WallOfLoveSection() {
  return (
    <section>
      <div className="py-16 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-5xl font-semibold">Loved by the Community</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3 ">
            {testimonialChunks.map((chunk, chunkIndex) => (
              <div key={chunkIndex} className="space-y-3 ">
                {chunk.map(({ name, role, quote, image }, index) => (
                  <Card key={index} className="hover:shadow-2xl cursor-pointer">
                    <CardContent className="grid grid-cols-[auto_1fr] gap-3 pt-6 ">
                      <Avatar className="size-9">
                        <AvatarImage
                          alt={name}
                          src={image}
                          loading="lazy"
                          width="120"
                          height="120"
                        />
                        <AvatarFallback>ST</AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">{name}</h3>

                        <span className="text-muted-foreground block text-sm tracking-wide">
                          {role}
                        </span>

                        <blockquote className="mt-3">
                          <p className="text-gray-700 dark:text-gray-300">
                            {quote}
                          </p>
                        </blockquote>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
