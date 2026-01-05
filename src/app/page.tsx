import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Trading Journal
            </span>
            <br />
            <span className="text-white">& Risk Management</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Protect yourself from yourself. Enforce discipline, control losses,
            and grow your trading account consistently.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition text-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition text-lg"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Trading Journal</h3>
            <p className="text-slate-400">
              Log every trade with detailed entries. Track pairs, sessions,
              timeframes, and your emotional state.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-8">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-3">Risk Management</h3>
            <p className="text-slate-400">
              Enforce max risk per trade (2%), daily loss limits (4%),
              and automatic trade blocking when rules are violated.
            </p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700 rounded-xl p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-3">Daily Loss Guard</h3>
            <p className="text-slate-400">
              Prevent revenge trading. Trading UI gets locked when your
              daily loss limit is exceeded.
            </p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="mt-24 text-center">
          <blockquote className="text-2xl text-slate-300 italic max-w-3xl mx-auto">
            &quot;The system should protect the trader from himself.&quot;
          </blockquote>
          <p className="text-slate-500 mt-4">— Core Design Philosophy</p>
        </div>

        {/* Stats */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-emerald-400">2%</p>
            <p className="text-slate-400 text-sm mt-1">Max Risk Per Trade</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-emerald-400">4%</p>
            <p className="text-slate-400 text-sm mt-1">Max Daily Loss</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-emerald-400">1:2</p>
            <p className="text-slate-400 text-sm mt-1">Minimum RR Ratio</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-emerald-400">$100</p>
            <p className="text-slate-400 text-sm mt-1">Starting Capital</p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to trade with discipline?</h2>
          <p className="text-slate-400 mb-8">Start with just $100 and grow consistently.</p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition text-lg"
          >
            Create Your Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 mt-24">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Trading Journal & Risk Management System</p>
          <p className="mt-2">Not a signal provider. Not auto-trading. Just pure discipline.</p>
        </div>
      </footer>
    </div>
  );
}
