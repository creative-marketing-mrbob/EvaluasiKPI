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
  const [sheets, setSheets] = useState<MemberSheet[]>(starterSheets);
  const [activeInput, setActiveInput] = useState<ActiveInput>(null);
  const [draftNote, setDraftNote] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingNote, setEditingNote] = useState<EditingNote>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [draggedMemberId, setDraggedMemberId] = useState<number | null>(null);
  const [draggedNote, setDraggedNote] = useState<DraggedNote>(null);
  const tabsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("simple-team-sheets");
    if (saved) setSheets(JSON.parse(saved) as MemberSheet[]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("simple-team-sheets", JSON.stringify(sheets));
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
