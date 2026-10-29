import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import NoteArea from "../components/NoteArea";
import Note from "../components/Note";

export default function Home() {
  const [noteItems, setNoteitems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. بنعرف دالة async جوا الـ useEffect
    async function fetchNotesAndAuth() {
      try {
        // 2. بنفحص الأول هل اليوزر مسجل دخول ولا لأ
        const authResponse = await fetch(
          "http://localhost:3000/api/check-auth",
          {
            credentials: "include",
          },
        );

        if (!authResponse.ok) {
          navigate("/"); // لو مش مسجل، اطرده لبرة
          return;
        }

        // 3. لو مسجل، بنسحب النوتات بتاعته
        const notesResponse = await fetch("http://localhost:3000/api/notes", {
          credentials: "include",
        });

        const data = await notesResponse.json();

        if (data && data.notes) {
          setNoteitems(data.notes);
        }
      } catch (err) {
        console.log("Error:", err);
      }
    }

    // 4. بننادي الدالة دي عشان تشتغل أول ما الصفحة تفتح
    fetchNotesAndAuth();
  }, [navigate]); // الـ Dependency Array

  function handleAdd(note) {
    fetch("http://localhost:3000/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((newNoteFromBackend) => {
        setNoteitems((preValues) => [...preValues, newNoteFromBackend]);
      });
  }

  function deletItem(id) {
    console.log("ID being deleted:", id, typeof id);
    fetch(`http://localhost:3000/api/notes/${id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((notes) => {
        setNoteitems(notes);
      })
      .catch((err) => console.log("Error deleting:", err));
  }

  function editNote(id, editedNote) {
    fetch(`http://localhost:3000/api/notes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedNote),
      credentials: "include",
    })
      .then((res) => res.json())
      .then((newNotes) => {
        setNoteitems(newNotes);
      });
  }

  async function handleLogout() {
    try {
      const response = await fetch("http://localhost:3000/api/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      } else {
        console.log("logout fail");
      }
    } catch (err) {
      console.log("Error:", err);
    }
  }

  return (
    <>
      <NoteArea onAdd={handleAdd} />
      <div className="notes">
        {noteItems.map((note) => {
          return (
            <Note
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              onDelete={deletItem}
              onEdit={editNote}
            />
          );
        })}
      </div>
      <button className="logOut" onClick={handleLogout}>
        Logout
      </button>
    </>
  );
}
