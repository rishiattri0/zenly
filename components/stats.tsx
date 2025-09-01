export default function StatsSection() {
  return (
    <section className="py-12 md:py-20 scroll-mt-20" id="Reviews">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center">
          <h2 className="text-4xl font-medium lg:text-5xl">
            Our Community in Numbers
          </h2>
          <p>
            Every statistic represents a step forward in someone's journey to
            well-being. We're honored to provide a supportive space for healing
            and growth.
          </p>
        </div>

        <div className="grid gap-12 divide-y *:text-center md:grid-cols-3 md:gap-2 md:divide-x md:divide-y-0 ">
          <div className="space-y-4">
            <div className="text-5xl font-bold">10,000+</div>
            <p>Individuals Supported</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">98%</div>
            <p>Report Feeling More hopeful</p>
          </div>
          <div className="space-y-4">
            <div className="text-5xl font-bold">2M+</div>
            <p>Supportive Conversations</p>
          </div>
        </div>
      </div>
    </section>
  );
}
