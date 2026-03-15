"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Sponsor = {
  id: string;
  name: string;
  industry: string | null;
  location: string | null;
  sponsorship_status: string | null;
  website: string | null;
  notes: string | null;
  sponsor_tier: string | null;
  priority_score: number | null;
  uk_region: string | null;
  target_student_friendly: boolean | null;
  open_jobs_count: number | null;
  intelligence_notes: string | null;
};

const PAGE_SIZE = 100;

function SponsorsPageContent() {
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [error, setError] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [studentFriendlyFilter, setStudentFriendlyFilter] = useState("");
  const [openJobsFilter, setOpenJobsFilter] = useState("");

  const [page, setPage] = useState(1);

  useEffect(() => {
    const location = searchParams.get("location") || "";
    const industry = searchParams.get("industry") || "";
    const status = searchParams.get("status") || "";
    const studentFriendly = searchParams.get("studentFriendly") || "";
    const openJobs = searchParams.get("openJobs") || "";
    const q = searchParams.get("q") || "";

    setLocationFilter(location);
    setIndustryFilter(industry);
    setStatusFilter(status);
    setStudentFriendlyFilter(studentFriendly);
    setOpenJobsFilter(openJobs);
    setSearch(q);
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    loadSponsors();
  }, [
    page,
    search,
    locationFilter,
    industryFilter,
    statusFilter,
    studentFriendlyFilter,
    openJobsFilter,
  ]);

  async function loadSponsors() {
    setLoading(true);
    setError("");

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("sponsors")
      .select(
        `
        id,
        name,
        industry,
        location,
        sponsorship_status,
        website,
        notes,
        sponsor_tier,
        priority_score,
        uk_region,
        target_student_friendly,
        open_jobs_count,
        intelligence_notes
      `,
        { count: "exact" }
      )
      .order("priority_score", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,notes.ilike.%${search}%,intelligence_notes.ilike.%${search}%`
      );
    }

    if (locationFilter) {
      query = query.eq("location", locationFilter);
    }

    if (industryFilter) {
      query = query.eq("industry", industryFilter);
    }

    if (statusFilter) {
      query = query.eq("sponsorship_status", statusFilter);
    }

    if (studentFriendlyFilter === "Yes") {
      query = query.eq("target_student_friendly", true);
    }

    if (studentFriendlyFilter === "No") {
      query = query.or(
        "target_student_friendly.is.null,target_student_friendly.eq.false"
      );
    }

    if (openJobsFilter === "Yes") {
      query = query.gt("open_jobs_count", 0);
    }

    if (openJobsFilter === "No") {
      query = query.eq("open_jobs_count", 0);
    }

    const { data, error, count } = await query;

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSponsors((data || []) as Sponsor[]);
    setTotalCount(count || 0);
    setLoading(false);
  }

  async function loadUniqueValues(column: "location" | "industry") {
    const { data } = await supabase
      .from("sponsors")
      .select(column)
      .not(column, "is", null)
      .limit(1000);

    return Array.from(
      new Set(
        (data || [])
          .map((row: any) => row[column]?.trim?.())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }

  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [uniqueIndustries, setUniqueIndustries] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const [locations, industries] = await Promise.all([
        loadUniqueValues("location"),
        loadUniqueValues("industry"),
      ]);
      setUniqueLocations(locations);
      setUniqueIndustries(industries);
    })();
  }, []);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function goToPreviousPage() {
    setPage((prev) => Math.max(1, prev - 1));
  }

  function goToNextPage() {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }

  function clearFilters() {
    setSearch("");
    setLocationFilter("");
    setIndustryFilter("");
    setStatusFilter("");
    setStudentFriendlyFilter("");
    setOpenJobsFilter("");
    setPage(1);
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p>Loading sponsors...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold">Visa Sponsorship Companies</h1>
        <p className="mt-2 text-black/70">
          Explore UK companies likely to sponsor Skilled Worker visas and
          discover the best employers for international students.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input
            type="text"
            placeholder="Search company name or notes"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-4 py-3"
          />

          <select
            value={locationFilter}
            onChange={(e) => {
              setLocationFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">All locations</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>

          <select
            value={industryFilter}
            onChange={(e) => {
              setIndustryFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">All industries</option>
            {uniqueIndustries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">All sponsorship types</option>
            <option value="Available">Available</option>
            <option value="Not available">Not available</option>
            <option value="Unknown">Unknown</option>
          </select>

          <select
            value={studentFriendlyFilter}
            onChange={(e) => {
              setStudentFriendlyFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">Student friendly: Any</option>
            <option value="Yes">Student friendly only</option>
            <option value="No">Not marked student friendly</option>
          </select>

          <select
            value={openJobsFilter}
            onChange={(e) => {
              setOpenJobsFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border px-4 py-3"
          >
            <option value="">Open jobs: Any</option>
            <option value="Yes">Has open jobs</option>
            <option value="No">No open jobs</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={clearFilters}
            className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Clear filters
          </button>

          <p className="text-sm text-black/60">
            {totalCount} sponsor companies found
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl border bg-white p-5 text-sm text-red-600">
          {error}
        </div>
      )}

      {!error && sponsors.length === 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6">
          No sponsor companies match your filters.
        </div>
      )}

      {!error && sponsors.length > 0 && (
        <>
          <div className="mt-6 flex items-center justify-between gap-4">
            <p className="text-sm text-black/70">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount} sponsor companies
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={page === 1}
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                ← Previous
              </button>

              <span className="text-sm text-black/70">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={page === totalPages}
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {sponsors.map((company) => (
              <div
                key={company.id}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <h2 className="text-xl font-bold">{company.name}</h2>

                <p className="mt-2 text-black/70">
                  {company.industry || "Industry not set"} •{" "}
                  {company.location || "Location not set"}
                </p>

                <p className="mt-1 text-sm text-black/60">
                  Sponsorship: {company.sponsorship_status || "Unknown"}
                </p>

                <p className="mt-1 text-sm text-black/60">
                  Tier: {company.sponsor_tier || "Unknown"} • Score:{" "}
                  {company.priority_score ?? 0}
                </p>

                <p className="mt-1 text-sm text-black/60">
                  Open jobs: {company.open_jobs_count ?? 0}
                </p>

                {company.target_student_friendly && (
                  <span className="mt-3 inline-block rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                    Student Friendly
                  </span>
                )}

                {company.intelligence_notes && (
                  <p className="mt-4 text-sm text-black/80">
                    {company.intelligence_notes}
                  </p>
                )}

                {!company.intelligence_notes && company.notes && (
                  <p className="mt-4 text-sm text-black/80">{company.notes}</p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold hover:text-black/70"
                    >
                      Visit website →
                    </a>
                  )}

                  <Link
                    href={`/sponsors/${company.id}`}
                    className="text-sm font-semibold hover:text-black/70"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default function SponsorsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-6 py-12">
          <p>Loading sponsors...</p>
        </main>
      }
    >
      <SponsorsPageContent />
    </Suspense>
  );
}