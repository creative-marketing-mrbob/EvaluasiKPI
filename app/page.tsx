"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type EntryType = "Evaluasi" | "Apresiasi";

type Entry = {
  id: number;
  month: string;
  member: string;
  type: EntryType;
  note: string;
};

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const starterEntries: Entry[] = [
  {
    id: 1,
    month: "Agustus",
    member: "Dewi Fitriana",
    type: "Evaluasi",
    note: "Perlu pengembangan ide inovasi konten di TikTok.",
  },
  {
    id: 2,
    month: "Agustus",
    member: "Dewi Fitriana",
    type: "Evaluasi",
    note: "Strategi OKR untuk peningkatan angka likes TikTok.",
  },
  {
    id: 3,
    month: "Agustus",
    member: "Dewi Fitriana",
    type: "Evaluasi",
    note: "Perlu peningkatan pada sisi strategic thinking.",
  },
  {
    id: 4,
    month: "Agustus",
    member: "Dewi Fitriana",
    type: "Apresiasi",
    note: "Komunikasi dengan tim dan divisi lain sudah membaik.",
  },
  {
    id: 5,
    month: "Agustus",
    member: "Dewi Fitriana",
    type: "Apresiasi",
    note: "Kualitas leadership membaik dari periode sebelumnya.",
  },
  {
    id: 6,
    month: "September",
    member: "Tim Kreatif",
    type: "Evaluasi",
    note: "Rapikan dokumentasi ide mingguan agar mudah ditindaklanjuti.",
  },
  {
    id: 7,
    month: "September",
    member: "Tim Kreatif",
    type: "Apresiasi",
    note: "Tempo eksekusi konten lebih stabil dan koordinasi lebih cepat.",
  },
];

export default function Home() {
  const [activeMonth, setActiveMonth] = useState("Agustus");
  const [entries, setEntries] = useState<Entry[]>(starterEntries);
  const [member, setMember] = useState("Dewi Fitriana");
  const [type, setType] = useState<EntryType>("Evaluasi");
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("team-evaluation-entries");
    if (saved) {
      setEntries(JSON.parse(saved) as Entry[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "team-evaluation-entries",
      JSON.stringify(entries),
    );
  }, [entries]);

  const filteredEntries = useMemo(
    () => entries.filter((entry) => entry.month === activeMonth),
    [activeMonth, entries],
  );

  const evaluationCount = filteredEntries.filter(
    (entry) => entry.type === "Evaluasi",
  ).length;
  const appreciationCount = filteredEntries.filter(
    (entry) => entry.type === "Apresiasi",
  ).length;

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member.trim() || !note.trim()) return;

    setEntries((current) => [
      {
        id: Date.now(),
        month: activeMonth,
        member: member.trim(),
        type,
        note: note.trim(),
      },
      ...current,
    ]);
    setNote("");
  }

  return (
    <main className="site-shell">
      <header className="topbar" aria-label="Header aplikasi">
        <div className="brand-mark">
          <span>MR.BOB</span>
          <strong>Super Seru!</strong>
        </div>
        <div>
          <p className="eyebrow">Team Evaluation Board</p>
          <h1>Evaluasi & Apresiasi Tim</h1>
        </div>
        <button className="ghost-button" type="button">
          Desktop
        </button>
      </header>

      <section className="hero-panel">
        <div className="hero-icon" aria-hidden="true">
          <span />
        </div>
        <h2>Monthly Team Check</h2>
        <p>Catat evaluasi dan apresiasi tiap anggota tim dalam satu tampilan.</p>
      </section>

      <section className="workspace" aria-label="Form dan daftar evaluasi">
        <aside className="form-area">
          <div className="section-heading">
            <p>Isi catatan</p>
            <span>{activeMonth}</span>
          </div>

          <div className="month-tabs" role="tablist" aria-label="Pilih bulan">
            {months.map((month) => (
              <button
                aria-selected={activeMonth === month}
                className={activeMonth === month ? "active" : ""}
                key={month}
                onClick={() => setActiveMonth(month)}
                role="tab"
                type="button"
              >
                {month.slice(0, 3)}
              </button>
            ))}
          </div>

          <form className="entry-form" onSubmit={addEntry}>
            <label>
              <span>
                <i className="label-icon blue">N</i>
                Nama anggota
              </span>
              <input
                onChange={(event) => setMember(event.target.value)}
                placeholder="Contoh: Rina Amalia"
                type="text"
                value={member}
              />
            </label>

            <label>
              <span>
                <i className="label-icon green">T</i>
                Jenis catatan
              </span>
              <select
                onChange={(event) => setType(event.target.value as EntryType)}
                value={type}
              >
                <option>Evaluasi</option>
                <option>Apresiasi</option>
              </select>
            </label>

            <label>
              <span>
                <i className="label-icon coral">C</i>
                Catatan
              </span>
              <textarea
                onChange={(event) => setNote(event.target.value)}
                placeholder="Tulis poin evaluasi atau apresiasi di sini"
                rows={5}
                value={note}
              />
            </label>

            <button className="primary-button" type="submit">
              Tambah Catatan
            </button>
          </form>

          <div className="tips" aria-label="Ringkasan bulan aktif">
            <p>
              <span className="mini-icon blue" />
              {evaluationCount} evaluasi tersimpan bulan ini.
            </p>
            <p>
              <span className="mini-icon green" />
              {appreciationCount} apresiasi tersimpan bulan ini.
            </p>
            <p>
              <span className="mini-icon coral" />
              Kamu bisa tambah catatan baru kapan saja lewat form ini.
            </p>
          </div>
        </aside>

        <section className="table-area">
          <div className="section-heading">
            <p>Daftar catatan</p>
            <span>{filteredEntries.length} item</span>
          </div>

          <div className="record-table" role="table" aria-label="Tabel catatan">
            <div className="table-header" role="row">
              <span>No</span>
              <span>Nama</span>
              <span>Evaluasi</span>
              <span>Apresiasi</span>
            </div>

            {filteredEntries.length === 0 ? (
              <div className="empty-state">
                Belum ada catatan untuk bulan {activeMonth}.
              </div>
            ) : (
              filteredEntries.map((entry, index) => (
                <div className="table-row" key={entry.id} role="row">
                  <span>{index + 1}</span>
                  <strong>{entry.member}</strong>
                  <p>{entry.type === "Evaluasi" ? entry.note : ""}</p>
                  <p>{entry.type === "Apresiasi" ? entry.note : ""}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
