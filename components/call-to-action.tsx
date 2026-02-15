export default function CallToAction() {
  return (
    <section className="py-16 md:py-32" id="contact">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
            Contact Us
          </h2>
          <p className="mt-4">
            We&apos;d love to hear from you! If you have questions about our
            services.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="mailto:support@expensetracker-ai.com"
              className="rounded-2xl border border-black bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Send us an Email ✉️
            </a>
            <a
              href="tel:+11234567890"
              className="rounded-2xl border border-neutral-300 px-6 py-2.5 text-sm font-semibold transition hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
            >
              Call Us 📞
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
