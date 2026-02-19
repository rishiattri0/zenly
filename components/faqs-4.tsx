'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsFour() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'Is Zenly a replacement for therapy?',
            answer: 'No. Zenly is a supportive wellness companion, not a replacement for licensed mental health care. You can use it between therapy sessions for reflection, mood tracking, and coping support.',
        },
        {
            id: 'item-2',
            question: 'How does Zenly protect my privacy?',
            answer: 'Your wellness data is handled with strict privacy controls. We use secure authentication, protected storage, and access boundaries so your personal reflections stay private to your account.',
        },
        {
            id: 'item-3',
            question: 'What can I track in Zenly?',
            answer: 'You can log mood entries, journal thoughts, track wellness activities, and review trend insights over time. This helps you spot emotional patterns and build healthier routines.',
        },
        {
            id: 'item-4',
            question: 'Can I use Zenly during difficult moments?',
            answer: 'Yes. Zenly is available whenever you need a safe check-in space. For urgent safety concerns or crisis situations, contact local emergency services or a crisis hotline immediately.',
        },
        {
            id: 'item-5',
            question: 'Does Zenly work with my therapy journey?',
            answer: 'Absolutely. Many users use Zenly to capture thoughts between sessions, then share patterns and notes with their therapist for more focused conversations.',
        },
    ]

    return (
        <section className="py-16 md:py-24">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="mx-auto max-w-xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 text-balance">Answers about privacy, support, and how Zenly fits into your mental wellness routine.</p>
                </div>

                <div className="mx-auto mt-12 max-w-xl">
                    <Accordion
                        type="single"
                        collapsible
                        className="bg-muted dark:bg-muted/50 w-full rounded-2xl p-1">
                        {faqItems.map((item) => (
                            <div
                                className="group"
                                key={item.id}>
                                <AccordionItem
                                    value={item.id}
                                    className="data-[state=open]:bg-card dark:data-[state=open]:bg-muted peer rounded-xl border-none px-7 py-1 data-[state=open]:border-none data-[state=open]:shadow-sm">
                                    <AccordionTrigger className="cursor-pointer text-base hover:no-underline">{item.question}</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-base">{item.answer}</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <hr className="mx-7 border-dashed group-last:hidden peer-data-[state=open]:opacity-0" />
                            </div>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Can&apos;t find what you&apos;re looking for? Contact our{' '}
                        <Link
                            href="#"
                            className="text-primary font-medium hover:underline">
                            support team
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
