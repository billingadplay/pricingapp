import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { projectTypes, useQuoteStore } from "@/state/quoteStore";
import { TEMPLATE_CONFIGS, type ProjectType } from "@shared/pricing";

const DESCRIPTIONS: Record<ProjectType, string> = {
  company_profile: "Corporate overviews, culture storytelling, facility tours.",
  ads: "High-impact commercials and product promos with polished visuals.",
  fashion: "Editorial shoots and runway coverage with stylised lighting.",
  event: "Live events, conferences, and coverage with quick turnarounds.",
  social: "Short-form content tuned for YouTube, TikTok, and Reels.",
  animation: "Motion graphics, explainer videos, and animated stories.",
};

export default function Home() {
  const [, navigate] = useLocation();
  const setProjectType = useQuoteStore((state) => state.setProjectType);

  const handleSelect = (type: ProjectType) => {
    setProjectType(type);
    navigate("/builder");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200">
        <div className="mx-auto flex h-[100px] max-w-7xl items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600">
              <span className="text-lg font-bold text-white">P</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-blue-600">
              PriceRight
            </span>
          </div>

          <div className="hidden items-center gap-10 md:flex">
            <a href="#" className="text-lg font-medium text-gray-900 hover:text-blue-600">
              Products
            </a>
            <a href="#" className="text-lg font-medium text-gray-900 hover:text-blue-600">
              Benefit
            </a>
            <a href="#" className="text-lg font-medium text-gray-900 hover:text-blue-600">
              How it Works
            </a>
            <a href="#" className="text-lg font-medium text-gray-900 hover:text-blue-600">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-8">
            <button className="text-lg font-medium text-gray-600 hover:text-gray-900">
              Login
            </button>
            <Button
              className="h-[52px] rounded-full bg-blue-600 px-6 text-base font-semibold hover:bg-blue-700"
            >
              Get Demo
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24">
        {/* Decorative Background Blurs */}
        <div className="pointer-events-none absolute left-[-444px] top-[-443px] h-[887px] w-[887px] rounded-full bg-gradient-to-br from-purple-200/40 to-blue-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-[-200px] top-[-457px] h-[914px] w-[914px] rounded-full bg-gradient-to-br from-blue-200/40 to-purple-200/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-200px] left-[-457px] h-[914px] w-[914px] rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-200px] right-[-200px] h-[967px] w-[967px] rounded-full bg-gradient-to-br from-purple-200/30 to-blue-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-7xl font-bold leading-tight tracking-tight text-gray-900">
            Price your video projects
            <br />
            with confidence.
          </h1>

          <div className="mx-auto mt-12 max-w-2xl space-y-3">
            <div className="mx-auto h-4 w-[364px] rounded-full bg-blue-100/60" />
            <div className="mx-auto h-4 w-[638px] rounded-full bg-blue-100/60" />
          </div>

          <div className="mt-12 flex items-center justify-center gap-6">
            <Button
              onClick={() => navigate("/builder")}
              className="h-[52px] rounded-full bg-blue-600 px-6 text-base font-semibold hover:bg-blue-700"
            >
              Start Tool
            </Button>
            <Button
              variant="ghost"
              className="h-[52px] rounded-full px-6 text-base font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              See Pricing
            </Button>
          </div>
        </div>
      </section>

      {/* Project Type Cards Section */}
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-12">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Choose Your Project Type
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Pick a project type to get a head start with crew and gear presets.
          </p>
        </div>

        <main className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectTypes.map((type) => {
            const template = TEMPLATE_CONFIGS[type];
            return (
              <Card
                key={type}
                className="flex h-full flex-col shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardHeader>
                  <CardTitle className="capitalize">{template.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between">
                  <p className="text-sm text-slate-600">{DESCRIPTIONS[type]}</p>
                  <div className="mt-6 flex flex-col gap-2 text-sm text-slate-500">
                    <div>
                      <span className="font-medium text-slate-700">Default crew: </span>
                      {template.crew.map((line) => line.role).join(", ") || "Custom"}
                    </div>
                    <div>
                      <span className="font-medium text-slate-700">Default contingency: </span>
                      {(template.contingencyPct * 100).toFixed(1)}%
                    </div>
                  </div>
                  <Button className="mt-8" onClick={() => handleSelect(type)}>
                    Start Quote
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </main>
      </section>

      {/* Why Us Section */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
            <div className="lg:max-w-md">
              <p className="mb-3 text-xl font-semibold tracking-tight text-purple-600">
                WHY USE PRICERIGHT
              </p>
              <h2 className="text-4xl font-bold leading-tight tracking-tight text-gray-900">
                Easy, Simple,
                <br />
                Save Quote
              </h2>
            </div>
            <div className="lg:max-w-lg">
              <p className="text-xl text-gray-600">
                This pricing tool helps you stop the guess-work to price each project. It helps you value intangible factors to make the right price for each project.
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Benefit 1: Automatic Invoice Payment */}
            <div className="flex flex-col">
              <div className="relative mb-6 h-96 overflow-hidden rounded-xl bg-gray-100">
                <div className="absolute left-0 top-12 h-full w-full">
                  <div className="relative mx-auto h-[476px] w-[334px] overflow-hidden rounded-xl shadow-2xl">
                    <div className="h-full w-full bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-500">INVOICE</p>
                          <p className="text-2xl font-bold text-gray-900">#INV-2024-001</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="h-3 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-full rounded bg-gray-200" />
                        <div className="h-3 w-2/3 rounded bg-gray-200" />
                      </div>
                      <div className="mt-8 space-y-3">
                        <div className="h-2 w-1/2 rounded bg-gray-300" />
                        <div className="h-2 w-2/3 rounded bg-gray-300" />
                        <div className="h-2 w-3/4 rounded bg-gray-300" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-8 top-6 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-base font-semibold text-gray-900">Verified</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                  Automatic Invoice Payment
                </h3>
                <p className="text-base text-gray-600">
                  No need to pay manually, we provide automatic invoice payment service! Set a payment schedule and you're done, it's that easy!
                </p>
              </div>
            </div>

            {/* Benefit 2: Clear Payment History */}
            <div className="flex flex-col">
              <div className="relative mb-6 h-96 overflow-hidden rounded-xl bg-gray-100">
                <div className="absolute -left-96 top-12 h-full w-[726px]">
                  <div className="h-[326px] overflow-hidden rounded-xl bg-white shadow-xl">
                    <div className="border-b border-gray-200 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold text-gray-900">Transaction History</h4>
                        <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5">
                          <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-semibold text-gray-900">1 Jan - 1 Feb 2022</span>
                        </div>
                      </div>
                    </div>
                    <div className="border-b border-gray-200 px-6 py-2.5">
                      <div className="flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>Transactions</span>
                        <span>Date</span>
                        <span>Amount</span>
                        <span>Status</span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200 px-6">
                      {[
                        { name: "Bank Transfer", date: "Jan 01, 2022", amount: "$2,000.00", status: "Completed", color: "green" },
                        { name: "Paypal Account", date: "Jan 04, 2022", amount: "$2,000.00", status: "Pending", color: "yellow" },
                        { name: "Bank Transfer", date: "Jan 06, 2022", amount: "$2,000.00", status: "On Hold", color: "orange" },
                      ].map((transaction, i) => (
                        <div key={i} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200">
                              <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{transaction.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{transaction.date}</span>
                          <span className="text-sm font-semibold text-gray-900">{transaction.amount}</span>
                          <div className="flex items-center gap-2">
                            <div className={`h-4 w-4 rounded-full ${transaction.color === 'green' ? 'bg-green-500' : transaction.color === 'yellow' ? 'bg-yellow-500' : 'bg-orange-500'}`} />
                            <span className="text-xs font-semibold text-gray-900">{transaction.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                  Clear payment history
                </h3>
                <p className="text-base text-gray-600">
                  Still writing manual expenses? Our platform breaks down every expense you log down to the millisecond!
                </p>
              </div>
            </div>

            {/* Benefit 3: Multi-card Payments */}
            <div className="flex flex-col">
              <div className="relative mb-6 h-96 overflow-hidden rounded-xl bg-gray-100">
                <div className="absolute -left-16 top-12">
                  <div className="relative">
                    {/* Card 1 - Back */}
                    <div className="absolute left-4 top-24 h-[185px] w-[335px] overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 p-6 shadow-2xl">
                      <p className="mb-16 text-base font-normal text-white/90">Credit</p>
                      <p className="mb-2 font-mono text-base text-white">Emiway Bantai</p>
                      <p className="font-mono text-base text-white">2221 - 0057 - 4680 - 2089</p>
                      <div className="absolute right-6 top-6 text-xl font-bold text-white">MC</div>
                    </div>
                    {/* Card 2 - Middle */}
                    <div className="absolute -left-6 top-16 h-[185px] w-[335px] overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-teal-600 p-6 shadow-2xl">
                      <p className="mb-16 text-base font-normal text-white/90">Credit</p>
                      <p className="mb-2 font-mono text-base text-white">J Balvin</p>
                      <p className="font-mono text-base text-white">6011 - 1111 - 1111 - 1117</p>
                      <div className="absolute right-6 top-2 text-xl font-bold text-white">DISC</div>
                    </div>
                    {/* Card 3 - Front */}
                    <div className="relative left-0 top-8 h-[185px] w-[335px] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 p-6 shadow-2xl">
                      <p className="mb-16 text-base font-normal text-white/90">Credit</p>
                      <p className="mb-2 font-mono text-base text-white">Ed Sheeran</p>
                      <p className="font-mono text-base text-white">4111 - 1111 - 1111 - 1111</p>
                      <div className="absolute right-6 top-3 text-xl font-bold text-white">VISA</div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="mb-2 text-2xl font-semibold text-gray-900">
                  Use of multi-card payments
                </h3>
                <p className="text-base text-gray-600">
                  Have more than 1 bank account or credit/debit card? Our platform is already integrated with many banks around the world, for easier payments!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
