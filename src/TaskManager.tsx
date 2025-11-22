import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./supabase-client";


interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

function App() {
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  // ✅ Fetch all tasks
  const fetchTasks = async () => {
    const { data, error } = await supabase.from("tasks").select("*").order("id", { ascending: true });
    if (error) {
      console.error("❌ Error fetching tasks:", error.message);
    } else {
      setTasks(data || []);
    }
  };

  // ✅ Add or Update Task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.description) {
      alert("Please fill out both fields!");
      return;
    }

    if (editId) {
      // ✏️ UPDATE task
      const { error } = await supabase
        .from("tasks")
        .update({
          title: newTask.title,
          description: newTask.description,
        })
        .eq("id", editId);

      if (error) {
        console.error("❌ Error updating task:", error.message);
        alert("Error updating task!");
      } else {
        alert("✅ Task updated successfully!");
        setEditId(null);
        setNewTask({ title: "", description: "" });
        fetchTasks();
      }
    } else {
      // ➕ INSERT task
      const { error } = await supabase.from("tasks").insert([newTask]);

      if (error) {
        console.error("❌ Error adding task:", error.message);
        alert("Error adding task!");
      } else {
        alert("✅ Task added successfully!");
        setNewTask({ title: "", description: "" });
        fetchTasks();
      }
    }
  };

  // 🗑️ Delete task
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      console.error("❌ Error deleting task:", error.message);
      alert("Error deleting task!");
    } else {
      alert("🗑️ Task deleted!");
      fetchTasks();
    }
  };

  // ✏️ Edit button (load values into form)
  const handleEdit = (task: Task) => {
    setNewTask({ title: task.title, description: task.description });
    setEditId(task.id);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
        color: "#fff",
        fontFamily: "Arial, sans-serif",
        margin: 0,
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          padding: "2rem",
          borderRadius: "16px",
          width: "90%",
          maxWidth: "500px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(8px)",
          textAlign: "center",
        }}
      >

        <button
  onClick={async () => {
    await supabase.auth.signOut();
    window.location.reload();
  }}
  style={{
    backgroundColor: "#d63031",
    border: "none",
    color: "#fff",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "1rem",
  }}
>
  Sign Out
</button>

        <h2 style={{ marginBottom: "1.5rem" }}>
          {editId ? "Edit Task" : "Task Manager CRUD"}
        </h2>

        {/* ✅ Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: "1.5rem" }}>
          <input
            type="text"
            placeholder="Task Title"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, title: e.target.value }))
            }
            style={{
              width: "100%",
              marginBottom: "0.5rem",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              fontSize: "1rem",
            }}
          />
          <textarea
            placeholder="Task Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask((prev) => ({ ...prev, description: e.target.value }))
            }
            style={{
              width: "100%",
              marginBottom: "0.5rem",
              padding: "0.6rem",
              borderRadius: "8px",
              border: "none",
              outline: "none",
              fontSize: "1rem",
              resize: "none",
              height: "80px",
            }}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.7rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: editId ? "#0984e3" : "#00b894",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
            onMouseOver={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = editId
                ? "#076cc0"
                : "#019874";
            }}
            onMouseOut={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = editId
                ? "#0984e3"
                : "#00b894";
            }}
          >
            {editId ? "Update Task" : "Add Task"}
          </button>
        </form>

        {/* ✅ Task List */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                borderRadius: "10px",
                padding: "1rem",
                marginBottom: "0.75rem",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{task.title}</h3>
              <p style={{ marginBottom: "0.8rem" }}>{task.description}</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleEdit(task)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#0984e3",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    borderRadius: "8px",
                    border: "none",
                    background: "#d63031",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
