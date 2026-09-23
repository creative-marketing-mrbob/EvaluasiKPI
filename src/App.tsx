"use client";

import {
  DragEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NoteType = "evaluation" | "appreciation";

type MemberSheet = {
  id: number;
  month: string;
  name: string;
  evaluations: string[];
  appreciations: string[];
};

type MemberInfo = {
  id: number;
  name: string;
};

type ActiveInput = {
  memberId: number;
  type: NoteType;
} | null;

type EditingNote = {
  memberId: number;
  type: NoteType;
  index: number;
} | null;

type DraggedNote = {
  memberId: number;
  type: NoteType;
  index: number;
} | null;

type SyncStatus = "offline" | "loading" | "synced" | "saving" | "error";

declare global {
  interface Window {
    [key: `__evaluasiKpiCallback_${string}`]: ((payload: unknown) => void) | undefined;
  }
}

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

const septemberSeedSheets: MemberSheet[] = [
  {
    id: 1,
    month: "September",
    name: "Dewi Fitriana",
    evaluations: [
      "Project yang melebihi deadline (OKR)",
      "Daily report yang tidak full 100%",
    ],
    appreciations: [
      "Mampu membuat strategi dan testing untuk kemajuan platform",
      "Mampu membawa team untuk achieve KPI 100% di semua team",
      "Mampu memecahkan masalah dan memberikan tindakan preventif",
    ],
  },
  {
    id: 3,
    month: "September",
    name: "Cindy Viorina Rosanti",
    evaluations: [
      "Kurang tanggap dalam adaptasi trend yang ada",
      "Time management yang perlu diperbaiki",
    ],
    appreciations: [
      "Mampu menyelesaikan semua request dan target secara tepat waktu",
      "Tidak mengeluh saat ada tugas yang banyak",
    ],
  },
  {
    id: 4,
    month: "September",
    name: "Mario Aditya",
    evaluations: [
      "Likes tiktok yang masih belum dapat diachive",
      "Masih pelupa dalam tugas yang diberikan",
      "2 kali telat upload karena proses download video yang lama",
      "Telat upload story sehari karena sedang dalam perjalanan",
    ],
    appreciations: [
      "Optimis dalam achieve target yang diberikan",
      "Memberikan vibes tenang bahwa semuanya dapat diachieve",
    ],
  },
  {
    id: 5,
    month: "September",
    name: "Sulton",
    evaluations: [
      "Masih banyak project yang revisi",
      "Color grading yang masih kurang",
      "Belum bisa menentukan alurnya sendiri dan harus ditrigger dahulu",
      "Perlu ketelitian dalam membuat video",
    ],
    appreciations: [
      "Mulai ada peningkatan dalam editing konten",
      "Tidak komplain meskipun banyak yang direvisi",
    ],
  },
  {
    id: 2,
    month: "September",
    name: "Ilham Krisnaldhy",
    evaluations: [
      "Report daily sering lupa",
      "Perlu peningkatan dalam penentuan request yang ada sesuai dengan load team",
    ],
    appreciations: [
      "Bisa membawa team improve untuk KPI daripada bulan lalu",
      "Delegasi tugas sudah improve dan hampir tidak ada misskomunikasi",
      "Target lead tercapai untuk pertama kalinya",
    ],
  },
  {
    id: 6,
    month: "September",
    name: "Zakki",
    evaluations: [
      "Kemampuan layout desain kurang proporsi dan dimensi",
    ],
    appreciations: [
      "Mampu mengerjakan project request yang banyak di luar daily",
      "Mampu mengerjakan desain / tugas dengan cepat",
      "Terdapat peningkatan dalam membaca brief secara lengkap",
    ],
  },
  {
    id: 7,
    month: "September",
    name: "Reni",
    evaluations: [
      "Perlu peningkatan dalam bersosial dengan team team yang lain",
      "Kurang dalam kemampuan menangkap dan mengimplementasikan trend yang ada",
    ],
    appreciations: [
      "Cukup aktif dalam membantu pelaksanaan campaign",
      "Mampu mencari member dan KOL sesuai dengan kebutuhan kita dengan sangat baik",
      "Cukup baik dan berpotensi menjadi KOL specialist karena mampu approach pihak eksternal",
      "Progress yang cukup baik dalam penulisan naskah sesuai dengan goalsnya",
      "Quantity dan quality iklan yang sangat berprogress dari periode kemarin",
      "Kuat dalam mencari resource data yang dibutuhkan untuk publikasi",
      "Winning content iklan mendapatkan 3 padahal pertama kali mendapat winning content",
    ],
  },
  {
    id: 8,
    month: "September",
    name: "Amar",
    evaluations: [
      "Youtube belum bisa dihandle karena mengerjakan iklan, galaversary, dan request",
      "Quantity konten iklan yang belum dapat diachieve (5/6) dikarenakan overload event dan rombongan",
      "Perlu perhatian dalam penggunaan font",
      "Color grading masih harus improve",
      "Teaser belum bisa ke-handle karena overload",
    ],
    appreciations: [
      "Revisi iklan sudah jauh berkurang daripada sebelumnya dan hanya revisi minor",
      "Motion yang digunakan di iklan sangat bagus sehingga membuat winning content",
      "Dapat membuat video dengan skill editing yang tinggi",
      "Dapat mengerjakan video dengan ketepatan waktu yang berkembang",
    ],
  },
  {
    id: 9,
    month: "September",
    name: "Alin",
    evaluations: [
      "Quantity thumbnail youtube masih belum bisa dieksekusi karena overload request",
      "Perlu pemahaman tentang depth dan layouting object desain",
    ],
    appreciations: [
      "Dapat mengerjakan request dengan cukup cepat daripada periode sebelumnya asalkan ada referensi",
      "Mampu melakukan control emosi yang cukup baik",
    ],
  },
];

const STORAGE_KEY = "simple-team-sheets";
const GOOGLE_SHEETS_WEB_APP_URL = import.meta.env
  .VITE_GOOGLE_SHEETS_WEB_APP_URL as string | undefined;

function mergeUniqueNotes(currentNotes: string[], seedNotes: string[]) {
  return [
    ...currentNotes,
    ...seedNotes.filter((note) => !currentNotes.includes(note)),
  ];
}

function withSeptemberSeedData(currentSheets: MemberSheet[]) {
  const nextSheets = [...currentSheets];

  septemberSeedSheets.forEach((seedSheet) => {
    const existingMember = nextSheets.find(
      (sheet) => sheet.name.toLowerCase() === seedSheet.name.toLowerCase(),
    );
    const memberId = existingMember?.id ?? seedSheet.id;
    const existingSeptemberIndex = nextSheets.findIndex(
      (sheet) => sheet.id === memberId && sheet.month === "September",
    );

    if (existingSeptemberIndex === -1) {
      nextSheets.push({ ...seedSheet, id: memberId });
      return;
    }

    const existingSheet = nextSheets[existingSeptemberIndex];
    nextSheets[existingSeptemberIndex] = {
      ...existingSheet,
      name: existingMember?.name ?? seedSheet.name,
      evaluations: mergeUniqueNotes(
        existingSheet.evaluations,
        seedSheet.evaluations,
      ),
      appreciations: mergeUniqueNotes(
        existingSheet.appreciations,
        seedSheet.appreciations,
      ),
    };
  });

  return nextSheets;
}

function parseSheets(value: unknown): MemberSheet[] | null {
  if (!Array.isArray(value)) return null;

  const rows = value.filter((item): item is MemberSheet => {
    if (!item || typeof item !== "object") return false;
    const sheet = item as MemberSheet;
    return (
      typeof sheet.id === "number" &&
      typeof sheet.month === "string" &&
      typeof sheet.name === "string" &&
      Array.isArray(sheet.evaluations) &&
      Array.isArray(sheet.appreciations)
    );
  });

  return rows.length > 0 ? rows : null;
}

function loadSheetsFromGoogleSheet(url: string): Promise<MemberSheet[] | null> {
  return new Promise((resolve, reject) => {
    const callbackName = `__evaluasiKpiCallback_${Date.now()}`;
    const script = document.createElement("script");
    const separator = url.includes("?") ? "&" : "?";

    window[callbackName] = (payload: unknown) => {
      const data = payload as { ok?: boolean; sheets?: unknown; error?: string };
      delete window[callbackName];
      script.remove();

      if (!data.ok) {
        reject(new Error(data.error || "Google Sheet gagal dibaca"));
        return;
      }

      resolve(parseSheets(data.sheets));
    };

    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error("Google Sheet gagal dihubungi"));
    };

    script.src = `${url}${separator}action=getState&callback=${callbackName}&_=${Date.now()}`;
    document.body.appendChild(script);
  });
}

function saveSheetsToGoogleSheet(url: string, sheets: MemberSheet[]) {
  return fetch(url, {
    method: "POST",
    mode: "no-cors",
    body: JSON.stringify({
      action: "saveState",
      sheets,
      savedAt: new Date().toISOString(),
    }),
  });
}

function NoteCell({
  note,
  type,
  isEditing,
  isDragging,
  draft,
  onDraftChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  note: string | undefined;
  type: NoteType;
  isEditing: boolean;
  isDragging: boolean;
  draft: string;
  onDraftChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
}) {
  const label = type === "evaluation" ? "evaluasi" : "apresiasi";

  if (!note) {
    return (
      <div className="cell" onDragOver={onDragOver} onDrop={onDrop} />
    );
  }

  if (isEditing) {
    return (
      <div className="cell">
        <form className="note-edit-form" onSubmit={onSaveEdit}>
          <input
            autoFocus
            aria-label={`Ubah ${label}`}
            onChange={(event) => onDraftChange(event.target.value)}
            type="text"
            value={draft}
          />
          <div className="note-edit-actions">
            <button type="submit">Simpan</button>
            <button onClick={onCancelEdit} type="button">
              Batal
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="cell" onDragOver={onDragOver} onDrop={onDrop}>
      <div
        className={`note-item ${isDragging ? "is-note-dragging" : ""}`}
        draggable
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        title={`Geser untuk mengubah urutan ${label}`}
      >
        <span>{note}</span>
        <button
          aria-label={`Ubah ${label}`}
          className="note-edit-button"
          onClick={onStartEdit}
          type="button"
        >
          <img src="/test-english-assets/pencil.png" alt="" />
        </button>
        <button
          aria-label={`Hapus ${label}`}
          className="note-delete-button"
          onClick={onDelete}
          type="button"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const [activeMonth, setActiveMonth] = useState("Agustus");
  const [sheets, setSheets] = useState<MemberSheet[]>(() =>
    withSeptemberSeedData(starterSheets),
  );
  const [activeInput, setActiveInput] = useState<ActiveInput>(null);
  const [draftNote, setDraftNote] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingNote, setEditingNote] = useState<EditingNote>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [draggedMemberId, setDraggedMemberId] = useState<number | null>(null);
  const [draggedNote, setDraggedNote] = useState<DraggedNote>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(
    GOOGLE_SHEETS_WEB_APP_URL ? "loading" : "offline",
  );
  const tabsRef = useRef<HTMLElement | null>(null);
  const syncReadyRef = useRef(false);
  const saveTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const cachedSheets = saved ? parseSheets(JSON.parse(saved)) : null;
    if (cachedSheets) setSheets(withSeptemberSeedData(cachedSheets));

    if (!GOOGLE_SHEETS_WEB_APP_URL) {
      syncReadyRef.current = true;
      return;
    }

    setSyncStatus("loading");
    loadSheetsFromGoogleSheet(GOOGLE_SHEETS_WEB_APP_URL)
      .then((remoteSheets) => {
        syncReadyRef.current = true;
        if (remoteSheets) setSheets(withSeptemberSeedData(remoteSheets));
        setSyncStatus("synced");
      })
      .catch(() => {
        setSyncStatus("error");
      })
      .finally(() => {
        syncReadyRef.current = true;
      });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sheets));

    if (!GOOGLE_SHEETS_WEB_APP_URL || !syncReadyRef.current) return;

    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    setSyncStatus("saving");
    saveTimerRef.current = window.setTimeout(() => {
      saveSheetsToGoogleSheet(GOOGLE_SHEETS_WEB_APP_URL, sheets)
        .then(() => setSyncStatus("synced"))
        .catch(() => setSyncStatus("error"));
    }, 450);
  }, [sheets]);

  useEffect(() => {
    const nav = tabsRef.current;
    const active = nav?.querySelector<HTMLButtonElement>("button.active");
    if (!nav || !active) return;

    nav.scrollTo({
      left: active.offsetLeft - nav.clientWidth / 2 + active.offsetWidth / 2,
      behavior: "smooth",
    });
  }, [activeMonth]);

  const members = useMemo(() => {
    const seen = new Set<number>();
    return sheets.reduce<MemberInfo[]>((list, sheet) => {
      if (seen.has(sheet.id)) return list;
      seen.add(sheet.id);
      return [...list, { id: sheet.id, name: sheet.name }];
    }, []);
  }, [sheets]);

  const visibleSheets = useMemo(
    () =>
      members.map((member) => {
        const monthSheet = sheets.find(
          (sheet) => sheet.id === member.id && sheet.month === activeMonth,
        );

        return (
          monthSheet ?? {
            id: member.id,
            month: activeMonth,
            name: member.name,
            evaluations: [],
            appreciations: [],
          }
        );
      }),
    [activeMonth, members, sheets],
  );

  function openNoteInput(memberId: number, type: NoteType) {
    setActiveInput({ memberId, type });
    setDraftNote("");
    setEditingNote(null);
    setEditingNoteText("");
  }

  function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeInput || !draftNote.trim()) return;

    setSheets((currentSheets) => {
      const targetSheet = currentSheets.find(
        (sheet) =>
          sheet.id === activeInput.memberId && sheet.month === activeMonth,
      );
      const memberName =
        currentSheets.find((sheet) => sheet.id === activeInput.memberId)?.name ??
        "";

      if (!targetSheet) {
        return [
          ...currentSheets,
          {
            id: activeInput.memberId,
            month: activeMonth,
            name: memberName,
            evaluations:
              activeInput.type === "evaluation" ? [draftNote.trim()] : [],
            appreciations:
              activeInput.type === "appreciation" ? [draftNote.trim()] : [],
          },
        ];
      }

      return currentSheets.map((sheet) => {
        if (sheet.id !== activeInput.memberId || sheet.month !== activeMonth) {
          return sheet;
        }

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
      });
    });
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

  function deleteNote(memberId: number, type: NoteType, noteIndex: number) {
    cancelEditNote();

    setSheets((currentSheets) =>
      currentSheets.map((sheet) => {
        if (sheet.id !== memberId || sheet.month !== activeMonth) return sheet;

        if (type === "evaluation") {
          return {
            ...sheet,
            evaluations: sheet.evaluations.filter((_, index) => index !== noteIndex),
          };
        }

        return {
          ...sheet,
          appreciations: sheet.appreciations.filter(
            (_, index) => index !== noteIndex,
          ),
        };
      }),
    );
  }

  function startEditNote(
    memberId: number,
    type: NoteType,
    index: number,
    currentNote: string | undefined,
  ) {
    if (!currentNote) return;
    setEditingNote({ memberId, type, index });
    setEditingNoteText(currentNote);
    setActiveInput(null);
  }

  function cancelEditNote() {
    setEditingNote(null);
    setEditingNoteText("");
  }

  function saveEditNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingNote || !editingNoteText.trim()) return;

    const nextNote = editingNoteText.trim();

    setSheets((currentSheets) =>
      currentSheets.map((sheet) => {
        if (
          sheet.id !== editingNote.memberId ||
          sheet.month !== activeMonth
        ) {
          return sheet;
        }

        if (editingNote.type === "evaluation") {
          return {
            ...sheet,
            evaluations: sheet.evaluations.map((note, index) =>
              index === editingNote.index ? nextNote : note,
            ),
          };
        }

        return {
          ...sheet,
          appreciations: sheet.appreciations.map((note, index) =>
            index === editingNote.index ? nextNote : note,
          ),
        };
      }),
    );
    cancelEditNote();
  }

  function isEditingNote(memberId: number, type: NoteType, index: number) {
    return (
      editingNote?.memberId === memberId &&
      editingNote.type === type &&
      editingNote.index === index
    );
  }

  function startEditMember(member: MemberSheet) {
    setEditingMemberId(member.id);
    setEditingName(member.name);
    setActiveInput(null);
    cancelEditNote();
  }

  function saveMemberName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingMemberId || !editingName.trim()) return;

    setSheets((currentSheets) =>
      currentSheets.map((sheet) =>
        sheet.id === editingMemberId
          ? { ...sheet, name: editingName.trim() }
          : sheet,
      ),
    );
    setEditingMemberId(null);
    setEditingName("");
  }

  function startDragMember(
    event: DragEvent<HTMLDivElement>,
    memberId: number,
  ) {
    setDraggedNote(null);
    setDraggedMemberId(memberId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(memberId));
  }

  function dropMember(targetMemberId: number) {
    if (!draggedMemberId || draggedMemberId === targetMemberId) {
      setDraggedMemberId(null);
      return;
    }

    setSheets((currentSheets) => {
      const order = currentSheets.reduce<number[]>((list, sheet) => {
        if (list.includes(sheet.id)) return list;
        return [...list, sheet.id];
      }, []);
      const draggedIndex = order.indexOf(draggedMemberId);
      const targetIndex = order.indexOf(targetMemberId);
      if (draggedIndex === -1 || targetIndex === -1) return currentSheets;

      const nextOrder = order.filter((id) => id !== draggedMemberId);
      nextOrder.splice(targetIndex, 0, draggedMemberId);
      const orderMap = new Map(nextOrder.map((id, index) => [id, index]));

      return [...currentSheets].sort((first, second) => {
        const firstOrder = orderMap.get(first.id) ?? 0;
        const secondOrder = orderMap.get(second.id) ?? 0;
        if (firstOrder !== secondOrder) return firstOrder - secondOrder;
        return months.indexOf(first.month) - months.indexOf(second.month);
      });
    });

    setDraggedMemberId(null);
  }

  function startDragNote(
    event: DragEvent<HTMLDivElement>,
    memberId: number,
    type: NoteType,
    index: number,
  ) {
    event.stopPropagation();
    cancelEditNote();
    setDraggedMemberId(null);
    setDraggedNote({ memberId, type, index });
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", `${memberId}-${type}-${index}`);
  }

  function canDropNote(memberId: number, type: NoteType) {
    return draggedNote?.memberId === memberId && draggedNote.type === type;
  }

  function dropNote(
    event: DragEvent<HTMLDivElement>,
    memberId: number,
    type: NoteType,
    targetIndex: number,
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedNote || !canDropNote(memberId, type)) {
      setDraggedNote(null);
      return;
    }

    setSheets((currentSheets) =>
      currentSheets.map((sheet) => {
        if (sheet.id !== memberId || sheet.month !== activeMonth) return sheet;

        const notes =
          type === "evaluation" ? sheet.evaluations : sheet.appreciations;
        if (draggedNote.index < 0 || draggedNote.index >= notes.length) {
          return sheet;
        }

        const reorderedNotes = [...notes];
        const [movedNote] = reorderedNotes.splice(draggedNote.index, 1);
        const nextTargetIndex = Math.min(targetIndex, reorderedNotes.length);
        reorderedNotes.splice(nextTargetIndex, 0, movedNote);

        return type === "evaluation"
          ? { ...sheet, evaluations: reorderedNotes }
          : { ...sheet, appreciations: reorderedNotes };
      }),
    );

    setDraggedNote(null);
  }

  return (
    <main className="page">
      <section className="sheet">
        <section className="hero-card">
          <img
            alt="Mr.BOB Super Seru"
            className="hero-icon"
            src="/test-english-assets/logo-mrbob.png"
          />
          <h2>Evaluasi Creative Marketing</h2>
          <div className={`sync-status ${syncStatus}`}>
            {syncStatus === "offline"
              ? "Database lokal"
              : syncStatus === "loading"
                ? "Menghubungkan Google Sheet"
                : syncStatus === "saving"
                  ? "Menyimpan ke Google Sheet"
                  : syncStatus === "error"
                    ? "Google Sheet belum tersambung"
                    : "Tersimpan di Google Sheet"}
          </div>
        </section>

        <div className="sheet-actions">
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
        </div>

        <nav className="tabs" aria-label="Pilih bulan" ref={tabsRef}>
          {months.map((month) => (
            <button
              className={month === activeMonth ? "active" : ""}
              key={month}
              onClick={() => {
                setActiveMonth(month);
                setActiveInput(null);
                cancelEditNote();
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
              <section
                className={`member-table ${
                  draggedMemberId === member.id ? "is-dragging" : ""
                }`}
                key={member.id}
                onDragOver={(event) => {
                  if (draggedMemberId) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  dropMember(member.id);
                }}
              >
                <div
                  className="name-bar"
                  draggable={editingMemberId !== member.id}
                  onDragEnd={() => setDraggedMemberId(null)}
                  onDragStart={(event) => startDragMember(event, member.id)}
                  title="Geser untuk mengubah urutan"
                >
                  {editingMemberId === member.id ? (
                    <form className="name-edit-form" onSubmit={saveMemberName}>
                      <input
                        autoFocus
                        aria-label="Edit nama anggota"
                        onChange={(event) => setEditingName(event.target.value)}
                        type="text"
                        value={editingName}
                      />
                      <button type="submit">Simpan</button>
                      <button
                        onClick={() => {
                          setEditingMemberId(null);
                          setEditingName("");
                        }}
                        type="button"
                      >
                        Batal
                      </button>
                    </form>
                  ) : (
                    <>
                      <span>{member.name}</span>
                      <button
                        aria-label="Edit nama anggota"
                        className="edit-name-button"
                        onClick={() => startEditMember(member)}
                        type="button"
                      >
                        <img src="/test-english-assets/pencil.png" alt="" />
                      </button>
                    </>
                  )}
                </div>
                <div className="grid-table">
                  <div className="head">
                    <img src="/test-english-assets/sticky-notes.png" alt="" />
                    Evaluasi
                  </div>
                  <div className="head">
                    <img src="/test-english-assets/badge.png" alt="" />
                    Apresiasi
                  </div>

                  {rows.map((rowIndex) => (
                    <div className="table-row" key={rowIndex}>
                      <NoteCell
                        draft={editingNoteText}
                        isDragging={
                          draggedNote?.memberId === member.id &&
                          draggedNote.type === "evaluation" &&
                          draggedNote.index === rowIndex
                        }
                        isEditing={isEditingNote(
                          member.id,
                          "evaluation",
                          rowIndex,
                        )}
                        note={member.evaluations[rowIndex]}
                        onCancelEdit={cancelEditNote}
                        onDelete={() =>
                          deleteNote(member.id, "evaluation", rowIndex)
                        }
                        onDragEnd={() => setDraggedNote(null)}
                        onDragOver={(event) => {
                          if (canDropNote(member.id, "evaluation")) {
                            event.preventDefault();
                            event.stopPropagation();
                          }
                        }}
                        onDragStart={(event) =>
                          startDragNote(
                            event,
                            member.id,
                            "evaluation",
                            rowIndex,
                          )
                        }
                        onDrop={(event) =>
                          dropNote(event, member.id, "evaluation", rowIndex)
                        }
                        onDraftChange={setEditingNoteText}
                        onSaveEdit={saveEditNote}
                        onStartEdit={() =>
                          startEditNote(
                            member.id,
                            "evaluation",
                            rowIndex,
                            member.evaluations[rowIndex],
                          )
                        }
                        type="evaluation"
                      />
                      <NoteCell
                        draft={editingNoteText}
                        isDragging={
                          draggedNote?.memberId === member.id &&
                          draggedNote.type === "appreciation" &&
                          draggedNote.index === rowIndex
                        }
                        isEditing={isEditingNote(
                          member.id,
                          "appreciation",
                          rowIndex,
                        )}
                        note={member.appreciations[rowIndex]}
                        onCancelEdit={cancelEditNote}
                        onDelete={() =>
                          deleteNote(member.id, "appreciation", rowIndex)
                        }
                        onDragEnd={() => setDraggedNote(null)}
                        onDragOver={(event) => {
                          if (canDropNote(member.id, "appreciation")) {
                            event.preventDefault();
                            event.stopPropagation();
                          }
                        }}
                        onDragStart={(event) =>
                          startDragNote(
                            event,
                            member.id,
                            "appreciation",
                            rowIndex,
                          )
                        }
                        onDrop={(event) =>
                          dropNote(event, member.id, "appreciation", rowIndex)
                        }
                        onDraftChange={setEditingNoteText}
                        onSaveEdit={saveEditNote}
                        onStartEdit={() =>
                          startEditNote(
                            member.id,
                            "appreciation",
                            rowIndex,
                            member.appreciations[rowIndex],
                          )
                        }
                        type="appreciation"
                      />
                    </div>
                  ))}

                  <div className="add-row">
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
