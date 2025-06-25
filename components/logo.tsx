import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold text-lg shadow-lg">
        A
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-white">AllSwap</span>
    </Link>
  )
}