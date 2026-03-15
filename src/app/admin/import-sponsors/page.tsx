"use client";

import { useState } from "react";
import Papa from "papaparse";
import { supabase } from "@/lib/supabase/client";

type RawRow = Record<string, unknown>;

type SponsorRow = {
  name: string;
  industry: string | null;
  location: string | null;
  sponsorship_status: string | null;
  website: string | null;
  notes: string | null;
};

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, " ");
}

function getValue(row: RawRow, possibleKeys: string[]) {
  const entries = Object.entries(row);

  for (const wanted of possibleKeys) {
    const normalizedWanted = normalizeKey(wanted);

    for (const [actualKey, value] of entries) {
      if (normalizeKey(actualKey) === normalizedWanted) {
        return value;
      }
    }
  }

  return "";
}

function buildCleanRows(rows: RawRow[]) {
  const cleanedRowsRaw: SponsorRow[] = rows
    .map((row) => {
      const rawName = getValue(row, [
        "name",
        "organisation name",
        "organization name",
        "company name",
      ]);

      const rawLocation = getValue(row, [
        "location",
        "town/city",
        "town / city",
        "city",
      ]);

      const rawIndustry = getValue(row, ["industry"]);
      const rawStatus = getValue(row, [
        "sponsorship_status",
        "sponsorship status",
        "status",
      ]);
      const rawWebsite = getValue(row, ["website", "web site"]);
      const rawNotes = getValue(row, ["notes"]);

      return {
        name: String(rawName || "").trim(),
        industry: String(rawIndustry || "").trim() || "Unknown",
        location: String(rawLocation || "").trim() || null,
        sponsorship_status:
          String(rawStatus || "").trim() || "Available",
        website: String(rawWebsite || "").trim() || null,
        notes: String(rawNotes || "").trim() || "Licensed UK sponsor",
      };
    })
    .filter((row) => {
      if (!row.name) return false;
      if (row.name.toLowerCase() === "name") return false;
      if (row.name.toLowerCase() === "organisation name") return false;
      if (row.name.toLowerCase().includes("total")) return false;
      return true;
    });

  // Deduplicate by sponsor name inside the uploaded file
  const dedupeMap = new Map<string, SponsorRow>();

  for (const row of cleanedRowsRaw) {
    const key = row.name.toLowerCase().trim();

    if (!dedupeMap.has(key)) {
      dedupeMap.set(key, row);
      continue;
    }

    const existing = dedupeMap.get(key)!;

    dedupeMap.set(key, {
      name: existing.name || row.name,
      industry:
        existing.industry && existing.industry !== "Unknown"
          ? existing.industry
          : row.industry,
      location: existing.location || row.location,
      sponsorship_status:
        existing.sponsorship_status && existing.sponsorship_status !== "Unknown"
          ? existing.sponsorship_status
          : row.sponsorship_status,
      website: existing.website || row.website,
      notes: existing.notes || row.notes,
    });
  }

  return Array.from(dedupeMap.values());
}

function chunkArray<T>(items: T[], chunkSize: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

export default function ImportSponsorsPage() {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [rows, setRows] = useState<RawRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<SponsorRow[]>([]);

  function handleFile(file: File) {
    setMsg("");
    setError("");
    setRows([]);
    setHeaders([]);
    setPreview([]);

    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedRows = results.data || [];
        setRows(parsedRows);

        if (parsedRows.length > 0) {
          setHeaders(Object.keys(parsedRows[0]));
        }

        const cleanedRows = buildCleanRows(parsedRows);
        setPreview(cleanedRows.slice(0, 10));

        if (cleanedRows.length === 0) {
          setError(
            "No valid sponsor rows found. Check the detected headers below."
          );
        }
      },
      error: (err) => {
        setError(err.message);
      },
    });
  }

  async function importSponsors() {
    setSaving(true);
    setError("");
    setMsg("");

    const cleanedRows = buildCleanRows(rows);

    if (cleanedRows.length === 0) {
      setError("No valid rows found in CSV.");
      setSaving(false);
      return;
    }

    // Import in chunks to avoid freezing / giant single upserts
    const chunks = chunkArray(cleanedRows, 500);

    let importedCount = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];

      const { error } = await supabase
        .from("sponsors")
        .upsert(chunk, { onConflict: "name" });

      if (error) {
        setError(`Chunk ${i + 1} failed: ${error.message}`);
        setSaving(false);
        return;
      }

      importedCount += chunk.length;
      setMsg(`Imported ${importedCount} of ${cleanedRows.length} sponsors...`);
    }

    setMsg(`Imported ${importedCount} sponsors ✅`);
    setSaving(false);
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Import Sponsors</h1>
      <p className="mt-2 text-black/70">
        Upload a CSV file to bulk import sponsorship companies.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {msg && (
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm text-green-600">
          {msg}
        </div>
      )}

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <label
          htmlFor="csv-upload"
          className="inline-block cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Upload CSV
        </label>

        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />

        {rows.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-black/70">
              {rows.length} raw rows loaded
            </p>

            <button
              onClick={importSponsors}
              disabled={saving}
              className="mt-4 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Importing..." : "Import sponsors"}
            </button>
          </div>
        )}
      </div>

      {headers.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Detected CSV headers</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {headers.map((header) => (
              <span
                key={header}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {header}
              </span>
            ))}
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Preview</h2>

          <div className="mt-4 grid gap-3">
            {preview.map((row, index) => (
              <div key={index} className="rounded-xl border p-4">
                <p className="font-semibold">{row.name}</p>
                <p className="text-sm text-black/70">
                  {row.industry} • {row.location || "No location"} •{" "}
                  {row.sponsorship_status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}