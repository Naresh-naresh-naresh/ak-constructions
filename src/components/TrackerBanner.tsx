import Link from "next/link";
import { clientConfig } from "@/config/client";
import { STAGE_TEMPLATE } from "@/config/stages";

/**
 * Homepage banner advertising the client progress tracker.
 *
 * The phone mockup is rendered from the same STAGE_TEMPLATE the real tracker
 * uses, rather than being a screenshot. That way it can't drift out of sync with
 * the actual product, and there's no image to re-export when stages change.
 */
export default function TrackerBanner() {
  // First few stages, with the first two shown complete to imply progress.
  const previewStages = STAGE_TEMPLATE.slice(0, 5);

  return (
    <section id="tracker" className="bg-stone-900 px-4 py-16 text-white lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
        {/* Phone mockup */}
        <div className="flex justify-center md:order-2">
          <div className="w-full max-w-[280px] rounded-[2.5rem] border-4 border-stone-700 bg-stone-950 p-3 shadow-2xl">
            <div className="overflow-hidden rounded-[1.8rem] bg-stone-50 text-stone-900">
              <div className="flex items-center justify-between bg-orange-500 px-4 py-3 text-white">
                <span className="text-xs font-bold">{clientConfig.name}</span>
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-semibold">
                  On Schedule
                </span>
              </div>

              <div className="px-4 py-3">
                <p className="text-[11px] text-stone-500">Your project</p>
                <p className="text-sm font-bold">1,800 sq ft · G+1</p>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                  <div className="h-full w-[40%] rounded-full bg-orange-500" />
                </div>
                <p className="mt-1 text-[10px] text-stone-400">40% complete</p>

                <ul className="mt-3 space-y-1.5 pb-2">
                  {previewStages.map((stage, i) => {
                    const done = i < 2;
                    return (
                      <li
                        key={stage.key}
                        className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 ${
                          done
                            ? "border-green-200 bg-green-50"
                            : "border-stone-200 bg-white"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
                            done
                              ? "bg-green-500 text-white"
                              : "bg-stone-200 text-stone-500"
                          }`}
                        >
                          {done ? "✓" : i + 1}
                        </span>
                        <span
                          className={`truncate text-[10px] font-medium ${
                            done ? "text-green-800" : "text-stone-600"
                          }`}
                        >
                          {stage.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="md:order-1">
          <p className="inline-flex rounded-full border border-orange-400/40 bg-orange-500/10 px-4 py-1 text-sm font-medium text-orange-300">
            For our clients
          </p>
          <h2 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
            Track your site progress{" "}
            <span className="text-orange-400">any time</span>
          </h2>
          <p className="mt-4 max-w-lg text-lg text-stone-300">
            Sit back while we build your home. Log in with your mobile number to
            see exactly which stage your project is at — updated by our team as
            the work happens.
          </p>

          <ul className="mt-6 space-y-2.5 text-stone-300">
            <li className="flex gap-3">
              <span className="text-orange-400">✓</span>
              Every stage from foundation to handover, ticked off as it&apos;s done
            </li>
            <li className="flex gap-3">
              <span className="text-orange-400">✓</span>
              Your site engineer&apos;s name and number, one tap to call
            </li>
            <li className="flex gap-3">
              <span className="text-orange-400">✓</span>
              No app to install — works in your phone&apos;s browser
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/login"
              className="rounded-full bg-orange-500 px-8 py-4 text-center text-base font-semibold text-white transition hover:bg-orange-600"
            >
              Login to Track
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-stone-600 px-8 py-4 text-center text-base font-semibold text-white transition hover:border-stone-400 hover:bg-stone-800"
            >
              Create Account
            </Link>
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Existing clients: use the invite code we sent you on WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
