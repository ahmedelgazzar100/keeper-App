import { useState } from "react";

export default function Note(props) {
  const [isEdit, setIsedit] = useState(false);
  function handleEdit() {
    setIsedit(true);
  }
  function handleDelete() {
    props.onDelete(props.id);
  }
  const [note, setNote] = useState({
    id: props.id,
    title: props.title,
    content: props.content,
  });

  function handleOnchange(event) {
    const { name, value } = event.target;
    setNote((prevValue) => {
      return {
        ...prevValue,
        [name]: value,
      };
    });
  }

  function handleDone(event) {
    event.preventDefault();
    const newNote = note;
    props.onEdit(props.id, newNote);
    setIsedit(false);
  }

  return (
    <div className="note-card">
      {!isEdit ? (
        <>
          <h2>{props.title}</h2>
          <p>{props.content}</p>
          <button onClick={handleDelete}>Delete</button>
          <button onClick={handleEdit}>edit</button>
        </>
      ) : (
        <>
          <input
            onChange={handleOnchange}
            type="text"
            name="title"
            placeholder="title"
            value={note.title}
          />
          <textarea
            onChange={handleOnchange}
            name="content"
            placeholder="content"
            value={note.content}
          ></textarea>
          <button onClick={handleDone}>Done</button>
        </>
      )}
    </div>
  );
}
