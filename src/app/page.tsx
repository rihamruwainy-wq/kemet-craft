import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#faf6ee] text-[#2b2116]">
      <header className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <span className="text-xl font-bold tracking-tight">KemetCraft</span>
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/store" className="hover:underline">
            Store
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-[#2b2116] px-4 py-2 text-[#faf6ee] transition hover:opacity-90"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-20">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#a0671f]">
          Handcrafted in Egypt
        </p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          Heritage pieces from Pharaonic, Coptic and Islamic traditions.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-[#5c4a36]">
          Discover authentic crafts made by Egyptian artisans, delivered worldwide.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/store"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#a0671f] px-7 font-medium text-white transition hover:bg-[#8a5719]"
          >
            Browse the store
          </Link>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#2b2116]/20 px-7 font-medium transition hover:bg-[#2b2116]/5"
          >
            Sell your crafts
          </Link>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-6 py-8 text-sm text-[#5c4a36]">
        © KemetCraft
      </footer>
    </div>
  )
}
