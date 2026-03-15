"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type OccupationGuide = {
  id: string;
  label: string;
  typicalRange: string;
  benchmark: number;
  note: string;
};

const OCCUPATIONS: OccupationGuide[] = [
  {
    id: "software",
    label: "Software / Tech",
    typicalRange: "£42,000 – £85,000+",
    benchmark: 42000,
    note: "Tech roles often need salaries comfortably above the general threshold, especially in London.",
  },
  {
    id: "data",
    label: "Data / Analytics",
    typicalRange: "£38,000 – £65,000",
    benchmark: 40000,
    note: "Data roles can vary a lot by seniority and employer, so stronger salaries improve sponsorship chances.",
  },
  {
    id: "finance",
    label: "Finance / Consulting",
    typicalRange: "£38,000 – £70,000+",
    benchmark: 40000,
    note: "Graduate consulting and finance roles may start lower, but stronger employers often sit higher.",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    typicalRange: "£25,000 – £45,000+",
    benchmark: 28000,
    note: "Healthcare roles may fall under Health and Care rules, which can use lower salary baselines.",
  },
  {
    id: "engineering",
    label: "Engineering",
    typicalRange: "£38,000 – £70,000+",
    benchmark: 40000,
    note: "Engineering is often sponsorship-friendly, but salary varies a lot by specialty and location.",
  },
  {
    id: "operations",
    label: "Operations / Business Support",
    typicalRange: "£30,000 – £50,000",
    benchmark: 35000,
    note: "Operations roles can be more mixed for sponsorship, so employer and salary level matter a lot.",
  },
];

export default function VisaHubPage() {
  const [salary, setSalary] = useState("");
  const [isHealthCare, setIsHealthCare] = useState(false);
  const [isDiscounted, setIsDiscounted] = useState(false);
  const [occupationId, setOccupationId] = useState("software");

  const numericSalary = Number(salary || 0);

  const selectedOccupation = useMemo(() => {
    return OCCUPATIONS.find((o) => o.id === occupationId) ?? OCCUPATIONS[0];
  }, [occupationId]);

  const result = useMemo(() => {
    if (!numericSalary || numericSalary <= 0) return null;

    const standardThreshold = 41700;
    const discountedThreshold = 33400;
    const healthCareThreshold = 25000;

    const legalThreshold = isHealthCare
      ? healthCareThreshold
      : isDiscounted
      ? discountedThreshold
      : standardThreshold;

    const benchmark = selectedOccupation.benchmark;
    const strongerTarget = Math.max(legalThreshold, benchmark);

    let legalLabel = "Below baseline threshold";
    if (numericSalary >= standardThreshold && !isHealthCare && !isDiscounted) {
      legalLabel = "Meets standard baseline threshold";
    } else if (!isHealthCare && isDiscounted && numericSalary >= discountedThreshold) {
      legalLabel = "May meet discounted baseline threshold";
    } else if (isHealthCare && numericSalary >= healthCareThreshold) {
      legalLabel = "Meets Health and Care baseline threshold";
    }

    let competitiveness = "Low competitiveness";
    if (numericSalary >= strongerTarget) {
      competitiveness = "Strong for this role area";
    } else if (numericSalary >= legalThreshold) {
      competitiveness = "Meets baseline, but could be stronger";
    }

    return {
      legalThreshold,
      benchmark,
      strongerTarget,
      legalLabel,
      competitiveness,
      meetsBaseline: numericSalary >= legalThreshold,
    };
  }, [numericSalary, isHealthCare, isDiscounted, selectedOccupation]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold">
          UK Visa Hub for International Students
        </h1>

        <p className="mt-3 text-black/70">
          Learn how to move from a Student Visa to a Skilled Worker visa and
          estimate whether a salary looks competitive for sponsorship.
        </p>
      </div>

      <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">From Student Visa to Skilled Worker</h2>

        <p className="mt-2 text-black/70">
          Many international students stay in the UK after graduation by moving
          through these stages.
        </p>

        <div className="mt-6 grid gap-4 text-center md:grid-cols-4">
          <div className="rounded-xl border p-4">
            <p className="font-semibold">Student Visa</p>
            <p className="mt-1 text-sm text-black/70">
              Study at a UK university
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="font-semibold">Graduate Visa</p>
            <p className="mt-1 text-sm text-black/70">
              Work after graduation
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="font-semibold">Skilled Worker Visa</p>
            <p className="mt-1 text-sm text-black/70">
              Employer sponsorship required
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="font-semibold">ILR</p>
            <p className="mt-1 text-sm text-black/70">
              Permanent residence pathway
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Visa Salary Threshold Calculator</h2>

        <p className="mt-2 text-black/70">
          Use this as a quick estimate only. The real rule depends on both the
          general threshold and the specific going rate for the occupation code.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold">Role area</label>
            <select
              value={occupationId}
              onChange={(e) => setOccupationId(e.target.value)}
              className="mt-1 w-full rounded-xl border px-4 py-3"
            >
              {OCCUPATIONS.map((occupation) => (
                <option key={occupation.id} value={occupation.id}>
                  {occupation.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-black/60">
              Typical range: {selectedOccupation.typicalRange}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold">Annual salary (£)</label>
            <input
              type="number"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="e.g. 42000"
              className="mt-1 w-full rounded-xl border px-4 py-3"
            />
          </div>

          <div className="md:col-span-2 flex flex-col gap-3">
            <label className="flex items-center gap-3 rounded-xl border px-4 py-3">
              <input
                type="checkbox"
                checked={isHealthCare}
                onChange={(e) => setIsHealthCare(e.target.checked)}
              />
              <span className="text-sm">
                This is a Health and Care role
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border px-4 py-3">
              <input
                type="checkbox"
                checked={isDiscounted}
                onChange={(e) => setIsDiscounted(e.target.checked)}
                disabled={isHealthCare}
              />
              <span className="text-sm">
                Check discounted route (for example some new entrant / PhD / salary-list cases)
              </span>
            </label>
          </div>
        </div>

        {result && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-gray-50 p-5">
              <p className="text-sm text-black/60">Baseline threshold used</p>
              <p className="mt-1 text-2xl font-bold">
                £{result.legalThreshold.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-black/70">{result.legalLabel}</p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-5">
              <p className="text-sm text-black/60">Role-area benchmark</p>
              <p className="mt-1 text-2xl font-bold">
                £{result.benchmark.toLocaleString()}
              </p>
              <p className="mt-2 text-sm text-black/70">
                Based on typical market expectations for {selectedOccupation.label.toLowerCase()} roles.
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-5">
              <p className="text-sm text-black/60">Quick assessment</p>
              <p className="mt-1 text-2xl font-bold">
                {result.competitiveness}
              </p>
              <p className="mt-2 text-sm text-black/70">
                {result.meetsBaseline
                  ? "The salary clears the baseline used in this estimate, but the exact occupation going rate still matters."
                  : "The salary looks below the baseline used in this estimate, so it may struggle unless special rules apply and the going rate also works."}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 rounded-xl border bg-gray-50 p-4 text-sm text-black/70">
          <p className="font-semibold">Role area note</p>
          <p className="mt-2">{selectedOccupation.note}</p>
        </div>

        <div className="mt-6 text-sm text-black/70">
          <p>Typical reference points:</p>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>Standard Skilled Worker baseline: <strong>£41,700</strong></li>
            <li>Some discounted cases: <strong>£33,400</strong></li>
            <li>Health and Care baseline: <strong>£25,000</strong></li>
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Graduate Visa</h2>

        <p className="mt-2 text-black/70">
          The Graduate Visa allows international students to stay in the UK
          after completing their degree and work for almost any employer.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-6 text-black/80">
          <li>2 years for Bachelor’s or Master’s graduates</li>
          <li>3 years for PhD graduates</li>
          <li>No employer sponsorship required</li>
          <li>Can help you find a later Skilled Worker sponsor</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Skilled Worker Visa</h2>

        <p className="mt-2 text-black/70">
          The Skilled Worker visa allows international graduates to stay in the
          UK long-term with employer sponsorship.
        </p>

        <ul className="mt-4 list-disc space-y-2 pl-6 text-black/80">
          <li>Requires a job offer from a licensed sponsor</li>
          <li>Requires a Certificate of Sponsorship</li>
          <li>Requires the correct occupation and salary level</li>
          <li>Can lead to settlement over time</li>
        </ul>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">Start Here</h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Link
            href="/sponsors"
            className="rounded-2xl border p-5 hover:bg-gray-50"
          >
            <h3 className="font-bold">Browse Sponsor Companies</h3>
            <p className="mt-2 text-sm text-black/70">
              Explore licensed sponsors and filter by location, industry, and open jobs.
            </p>
          </Link>

          <Link
            href="/jobs"
            className="rounded-2xl border p-5 hover:bg-gray-50"
          >
            <h3 className="font-bold">Explore Jobs</h3>
            <p className="mt-2 text-sm text-black/70">
              Search curated and employer-posted opportunities on the platform.
            </p>
          </Link>

          <Link
            href="/sponsors/top"
            className="rounded-2xl border p-5 hover:bg-gray-50"
          >
            <h3 className="font-bold">View Top Sponsors</h3>
            <p className="mt-2 text-sm text-black/70">
              Discover high-potential and student-friendly sponsors.
            </p>
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">CV Tip</h2>

        <p className="mt-2 text-black/70">
          It can help to state your visa position clearly when applying.
        </p>

        <div className="mt-4 rounded-xl border bg-gray-50 p-4 text-sm">
          Example:
          <br />
          <span className="font-medium">
            “Currently on Graduate Visa and eligible to switch to Skilled Worker sponsorship.”
          </span>
        </div>
      </section>
    </main>
  );
}