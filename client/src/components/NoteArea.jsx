import { useState } from "react";

export default function NoteArea(props) {
  const [note, setNote] = useState({
    title: "",
    content: "",
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

  function handleAdd(event) {
    event.preventDefault();

    props.onAdd(note);

    setNote({
      title: "",
      content: "",
    });
  }

  return (
    <form className="form-note" onSubmit={handleAdd}>
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
        required
      ></textarea>
      <button type="submit">Add</button>
    </form>
  );
}
