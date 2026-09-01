import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <div className="mx-auto flex h-14 w-full max-w-md items-center px-4">
        <Link href="/" className="font-heading text-lg font-medium">
          Daybook
        </Link>
      </div>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  );
}
