import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Testimonials() {
    return (
        <section className="py-16 md:py-32" id="testimonials">
            <div className="mx-auto max-w-6xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-4xl font-medium lg:text-5xl">Loved by thousands on their wellness journey</h2>
                    <p>Zenly has become a trusted companion for people seeking mental wellness support. Hear from those who found peace and balance through our platform.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2">
                    <Card className="grid grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">💚</span>
                                <span className="text-lg font-semibold">Life-changing Support</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">Zenly has transformed my mental health journey. The AI conversations are incredibly empathetic and the mood tracking helps me understand my patterns. I finally feel supported and understood. This platform has given me tools I never knew I needed for emotional wellness.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarFallback>SM</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <cite className="text-sm font-medium">Sarah Mitchell</cite>
                                        <span className="text-muted-foreground block text-sm">Wellness Advocate</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="md:col-span-2">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p className="text-xl font-medium">The 24/7 availability has been a lifesaver during difficult moments. Having someone to talk to anytime, day or night, has made such a difference in my anxiety management.</p>

                                <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                    <Avatar className="size-12">
                                        <AvatarFallback>JC</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">James Chen</cite>
                                        <span className="text-muted-foreground block text-sm">Mental Health Advocate</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p>The mood analytics helped me identify patterns I never noticed before. Understanding my emotional triggers has been transformative for my daily wellbeing.</p>

                                <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                                    <Avatar className="size-12">
                                        <AvatarFallback>EP</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <cite className="text-sm font-medium">Emma Parker</cite>
                                        <span className="text-muted-foreground block text-sm">Yoga Instructor</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                    <Card className="card variant-mixed">
                        <CardContent className="h-full pt-6">
                            <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                <p>I've tried many wellness apps, but Zenly's compassionate AI conversations feel genuinely caring. It's like having a supportive friend who's always there.</p>

                                <div className="grid grid-cols-[auto_1fr] gap-3">
                                    <Avatar className="size-12">
                                        <AvatarFallback>RA</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">Robert Adams</p>
                                        <span className="text-muted-foreground block text-sm">Therapist</span>
                                    </div>
                                </div>
                            </blockquote>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}
