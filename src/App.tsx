import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";
import "./App.css";

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  image_url?: string;
  video_url?: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    image_url: "",
    video_url: "",
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  // Toggle Dark/Light Mode
  const toggleTheme = () => setDarkMode(!darkMode);

  // Fetch all tasks
  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("id", { ascending: false });

    if (error) console.error("fetchTasks error:", error);
    else setTasks(data || []);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Upload file to Supabase Storage
  const uploadFile = async (file: File, type: "image" | "video") => {
    setLoading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${type}s/${fileName}`;

    const { error } = await supabase.storage
      .from("task_uploads")
      .upload(filePath, file);

    if (error) {
      alert("File upload failed!");
      console.error("Upload error:", error);
      setLoading(false);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("task_uploads")
      .getPublicUrl(filePath);

    setLoading(false);
    return publicUrlData?.publicUrl || null;
  };

  // Add or Update Task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title.trim() || !newTask.description.trim()) {
      alert("Please fill in both title and description!");
      return;
    }

    const payload = {
      title: newTask.title,
      description: newTask.description,
      image_url: newTask.image_url || null,
      video_url: newTask.video_url || null,
    };

    const { error } = editId
      ? await supabase.from("tasks").update(payload).eq("id", editId)
      : await supabase.from("tasks").insert([payload]);

    if (error) {
      alert("Error saving task!");
      console.error("Insert/update error:", error);
    } else {
      alert(editId ? "Task updated!" : "Task added!");
      setEditId(null);
      setNewTask({ title: "", description: "", image_url: "", video_url: "" });
      setPreviewImage(null);
      setPreviewVideo(null);
      fetchTasks();
    }
  };

  // Delete task
  const handleDelete = async (id: number) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) alert("Error deleting task!");
    else fetchTasks();
  };

  // Edit task (load into form)
  const handleEdit = (task: Task) => {
    setEditId(task.id);
    setNewTask({
      title: task.title,
      description: task.description,
      image_url: task.image_url || "",
      video_url: task.video_url || "",
    });
    setPreviewImage(task.image_url || null);
    setPreviewVideo(task.video_url || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`page ${darkMode ? "dark" : "light"}`}>
      <div className="center-card" role="main">
        <div className="card-inner">
          <div className="top-controls">
            <button className="theme-btn" onClick={toggleTheme}>
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>

          {/* ✅ Tailwind Test */}
          <h1 className="text-3xl font-bold text-blue-500 mb-4">
            Hello Tailwind!
          </h1>

          <h2 className="title">{editId ? "Edit Task" : "Task Manager"}</h2>

          {/* Task Form */}
          <form onSubmit={handleSubmit} className="task-form">
            <input
              className="input"
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <textarea
              className="input textarea"
              placeholder="Task Description"
              value={newTask.description}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, description: e.target.value }))
              }
            />

            <label className="label">Upload Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  setPreviewImage(URL.createObjectURL(file));
                  const url = await uploadFile(file, "image");
                  setNewTask((p) => ({ ...p, image_url: url || "" }));
                }
              }}
            />

            <label className="label">Upload Video:</label>
            <input
              type="file"
              accept="video/*"
              onChange={async (e) => {
                if (e.target.files?.[0]) {
                  const file = e.target.files[0];
                  setPreviewVideo(URL.createObjectURL(file));
                  const url = await uploadFile(file, "video");
                  setNewTask((p) => ({ ...p, video_url: url || "" }));
                }
              }}
            />

            {loading && <p className="muted">Uploading...</p>}

            {previewImage && (
              <img className="preview-media" src={previewImage} alt="preview" />
            )}
            {previewVideo && (
              <video className="preview-media" src={previewVideo} controls />
            )}

            <button type="submit" className="primary full">
              {editId ? "Update Task" : "Add Task"}
            </button>
          </form>

          {/* Task List */}
          <ul className="task-list">
            {tasks.map((task) => (
              <li className="task-card" key={task.id}>
                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-desc">{task.description}</p>

                  {task.image_url && (
                    <img
                      className="preview-media"
                      src={task.image_url}
                      alt="task"
                    />
                  )}

                  {task.video_url && (
                    <video className="preview-media" controls>
                      <source src={task.video_url} type="video/mp4" />
                    </video>
                  )}

                  <div className="task-actions">
                    <button
                      onClick={() => handleEdit(task)}
                      className="btn edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="btn delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </div>
  );
}

export default App;
