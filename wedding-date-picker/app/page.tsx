import { WeddingDateForm } from "@/components/wedding-date-form";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 p-6 md:p-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          AI-Assisted Wedding Date Picker
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Enter location, zodiac signs, and preferred temperature range to get
          a suggested wedding date.
        </p>
      </header>

      <WeddingDateForm />
    </main>
  );
}
