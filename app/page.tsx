"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type NoteType = "evaluation" | "appreciation";

type MemberSheet = {
  id: number;
  month: string;
  name: string;
  evaluations: string[];
  appreciations: string[];
};

type ActiveInput = {
  memberId: number;
  type: NoteType;
} | null;

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

const starterSheets: MemberSheet[] = [
  {
    id: 1,
    month: "Agustus",
    name: "Dewi Fitriana",
    evaluations: [
      "Perlu pengembangan ide inovasi konten di TikTok",
      "Strategi OKR untuk peningkatan angka likes TikTok",
      "Perlu peningkatan pada segi strategic thinking",
      "Ada tanda-tanda team kehilangan motivasi kerja",
    ],
    appreciations: [
      "Komunikasi baik dengan tim maupun divisi lain sudah membaik",
      "Kualitas leadership yang membaik dari periode lalu",
    ],
  },
  {
    id: 2,
    month: "Agustus",
    name: "Ilham Krisnaldhy",
    evaluations: [
      "Perlu peningkatan pada kualitas output team",
      "Perlu peningkatan strategi optimasi lead magnet",
      "Perlu peningkatan pada strategi dan analisis marketing terutama agar iklan bisa winning",
      "Perlu peningkatan komunikasi dengan lintas divisi",
    ],
    appreciations: [],
  },
  {
    id: 3,
    month: "Agustus",
    name: "Cindy Viorina Rosanti",
    evaluations: [
      "Perlu peningkatan pada kualitas output team",
      "Perlu peningkatan strategi optimasi lead magnet",
      "Perlu peningkatan pada strategi dan analisis marketing terutama agar iklan bisa winning",
      "Perlu peningkatan komunikasi dengan lintas divisi",
    ],
    appreciations: [],
  },
  {
    id: 4,
    month: "Agustus",
    name: "Mario Aditya",
    evaluations: [
      "Perlu peningkatan pada kualitas output team",
      "Perlu peningkatan strategi optimasi lead magnet",
      "Perlu peningkatan pada strategi dan analisis marketing terutama agar iklan bisa winning",
      "Perlu peningkatan komunikasi dengan lintas divisi",
    ],
    appreciations: [],
  },
];

export default function Home() {
  const [activeMonth, setActiveMonth] = useState("Agustus");
  const [sheets, setSheets] = useState<MemberSheet[]>(starterSheets);
  const [activeInput, setActiveInput] = useState<ActiveInput>(null);
  const [draftNote, setDraftNote] = useState("");
  const [newMemberName, setNewMemberName] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("simple-team-sheets");
    if (saved) setSheets(JSON.parse(saved) as MemberSheet[]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("simple-team-sheets", JSON.stringify(sheets));
  }, [sheets]);

  const visibleSheets = useMemo(
    () => sheets.filter((sheet) => sheet.month === activeMonth),
    [activeMonth, sheets],
  );

  function openNoteInput(memberId: number, type: NoteType) {
    setActiveInput({ memberId, type });
    setDraftNote("");
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeInput || !draftNote.trim()) return;

    setSheets((currentSheets) =>
      currentSheets.map((sheet) => {
        if (sheet.id !== activeInput.memberId) return sheet;

        if (activeInput.type === "evaluation") {
          return {
            ...sheet,
            evaluations: [...sheet.evaluations, draftNote.trim()],
          };
        }

        return {
          ...sheet,
          appreciations: [...sheet.appreciations, draftNote.trim()],
        };
      }),
    );
    setActiveInput(null);
    setDraftNote("");
  }

  function addMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newMemberName.trim()) return;

    setSheets((currentSheets) => [
      ...currentSheets,
      {
        id: Date.now(),
        month: activeMonth,
        name: newMemberName.trim(),
        evaluations: [],
        appreciations: [],
      },
    ]);
    setNewMemberName("");
  }

  return (
    <main className="page">
      <section className="sheet">
        <header className="toolbar">
          <div>
            <p>Evaluasi & Apresiasi Tim</p>
            <h1>{activeMonth}</h1>
          </div>
          <form className="add-member" onSubmit={addMember}>
            <input
              aria-label="Nama anggota baru"
              onChange={(event) => setNewMemberName(event.target.value)}
              placeholder="Nama anggota baru"
              type="text"
              value={newMemberName}
            />
            <button type="submit">+ Anggota</button>
          </form>
        </header>

        <nav className="tabs" aria-label="Pilih bulan">
          {months.map((month) => (
            <button
              className={month === activeMonth ? "active" : ""}
              key={month}
              onClick={() => {
                setActiveMonth(month);
                setActiveInput(null);
              }}
              type="button"
            >
              {month}
            </button>
          ))}
        </nav>

        <div className="sheet-list">
          {visibleSheets.map((member) => {
            const rowCount = Math.max(
              member.evaluations.length,
              member.appreciations.length,
              1,
            );
            const rows = Array.from({ length: rowCount }, (_, index) => index);

            return (
              <section className="member-table" key={member.id}>
                <div className="name-bar">{member.name}</div>
                <div className="grid-table">
                  <div className="head no">No</div>
                  <div className="head">Evaluasi</div>
                  <div className="head">Apresiasi</div>

                  {rows.map((rowIndex) => (
                    <div className="table-row" key={rowIndex}>
                      <div className="cell number">{rowIndex + 1}</div>
                      <div className="cell">{member.evaluations[rowIndex] || ""}</div>
                      <div className="cell">
                        {member.appreciations[rowIndex] || ""}
                      </div>
                    </div>
                  ))}

                  <div className="add-row">
                    <div className="cell muted" />
                    <button
                      className="plus-cell"
                      onClick={() => openNoteInput(member.id, "evaluation")}
                      type="button"
                    >
                      + Evaluasi
                    </button>
                    <button
                      className="plus-cell"
                      onClick={() => openNoteInput(member.id, "appreciation")}
                      type="button"
                    >
                      + Apresiasi
                    </button>
                  </div>
                </div>

                {activeInput?.memberId === member.id ? (
                  <form className="inline-form" onSubmit={saveNote}>
                    <input
                      autoFocus
                      aria-label="Isi catatan"
                      onChange={(event) => setDraftNote(event.target.value)}
                      placeholder={
                        activeInput.type === "evaluation"
                          ? "Tulis evaluasi baru"
                          : "Tulis apresiasi baru"
                      }
                      type="text"
                      value={draftNote}
                    />
                    <button type="submit">Simpan</button>
                    <button onClick={() => setActiveInput(null)} type="button">
                      Batal
                    </button>
                  </form>
                ) : null}
              </section>
            );
          })}

          {visibleSheets.length === 0 ? (
            <div className="empty">
              Belum ada anggota di bulan {activeMonth}. Tambahkan nama anggota
              lewat kolom di atas.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
