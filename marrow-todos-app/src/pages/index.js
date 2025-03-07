import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Toaster, toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger, DialogContent, DialogArrow, DialogHeader, DialogDescription } from "../components/ui/dialog";
import { supabase } from "@/utils/supabase";

export default function TodosPage() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [userID, setUserID] = useState(null); // Initialize userID as null
  const [description, setDescription] = useState(""); 
  const [priority, setPriority] = useState("Medium"); 
  const [tags, setTags] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [openDialogId, setOpenDialogId] = useState(null); 
  const [editTodoTitle, setEditTodoTitle] = useState(""); 
  const [editTodoDescription, setEditTodoDescription] = useState("");
  const [editTodoTags, setEditTodoTags] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const [todosPerPage, setTodosPerPage] = useState(2);
  const [totalTodos, setTotalTodos] = useState(0);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUserID(session.user.id); 
      } else {
        window.location.href = "/login";
      }
    });

  }, []);

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    const offset = (currentPage - 1) * todosPerPage;

    try {
      // Fetch todos and count in parallel
      const [todosResponse, countResponse] = await Promise.all([
        fetch(`/api/todos?user_id=${userID}&limit=${todosPerPage}&offset=${offset}`),
        fetch(`/api/todos-count?user_id=${userID}`)
      ]);
      
      if (!todosResponse.ok) {
        throw new Error("Failed to fetch todos. Please check your network connection.");
      }
      if (!countResponse.ok) {
        throw new Error("Failed to fetch the total number of todos.");
      }
      
      const todosData = await todosResponse.json();
      const countData = await countResponse.json();
      
      setTodos(todosData);
      setTotalTodos(countData.count);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred while fetching todos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [userID, currentPage, todosPerPage]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const totalPages = Math.ceil(totalTodos / todosPerPage);

  const addTodo = useCallback(async () => {
    if (!newTodo || !description) {
      toast.error("Title and description are required.");
      return;
    }
    
    try {
      const todo = {
        user_id: userID,
        title: newTodo,
        priority: priority, 
        tags: tags.split(",").map(tag => tag.trim()), 
        description: description,
      };
  
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add todo. Please try again.");
      }
  
      // Reset form fields
      setNewTodo("");
      setDescription("");
      setTags("");
      
      // Refresh todos to include the newly added todo with proper pagination
      fetchTodos();
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred while adding the todo. Please try again.");
    }
  }, [newTodo, description, priority, tags, userID, fetchTodos]);

  const deleteTodo = async (todoID) => {
    try {
      const response = await fetch("/api/todos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todoID, userID }),
      });
  
      if (!response.ok) {
        throw new Error("Error deleting todo");
      }
      
      // Close the dialog
      setOpenDialogId(null);
      
      // Refresh todos to update the list
      fetchTodos();
      
    } catch (error) {
      console.error(error);
      toast.error(error.message); 
    }
  };
  
  const updateTodo = async (todoID, title, description, tags) => {
    if (!title || !description) {
      toast.error("Title and description are required.");
      return;
    }
    try {
      const updates = {
        title,
        description,
        tags: typeof tags === 'string' ? tags.split(",").map(tag => tag.trim()) : tags,
      };
      
      const response = await fetch("/api/todos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todoID, userID, ...updates }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to update todo. Please try again.");
      }
      
      // Close the dialog
      setOpenDialogId(null);
      
      // Refresh todos to update the list
      fetchTodos();
      
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred while updating the todo. Please try again.");
    }
  };

  // Function to open a dialog and set up editing state
  const openEditDialog = (todo) => {
    setOpenDialogId(todo.id);
    setEditTodoTitle(todo.title);
    setEditTodoDescription(todo.description);
    setEditTodoTags(todo.tags.join(", "));
  };

  // Function to add a tag during editing
  const addTag = (todoId, tag) => {
    if (!tag.trim()) return;
    
    setEditTodoTags(prev => {
      const tagsArray = prev ? prev.split(",").map(t => t.trim()) : [];
      return [...tagsArray, tag.trim()].join(", ");
    });
    
    setNewTag("");
  };
  
  // Function to export all todos
  const exportTodos = async () => {
    try {
      const response = await fetch(`/api/todos?user_id=${userID}`);
      if (!response.ok) {
        throw new Error("Failed to fetch todos for export.");
      }
      const todosData = await response.json();
  
      const filteredTodosData = todosData.map(({ id, user_id, ...rest }) => rest);
  
      const json = JSON.stringify(filteredTodosData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
  
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `todos.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while exporting todos.");
    }
  };

  return (
    <div>
      <Toaster />
      <div className="flex flex-col space-y-4">
        <Input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description"
        />
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Add tags (comma separated)"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <Button onClick={addTodo}>Add Todo</Button>
      </div>
      {loading ? 
        <p>Loading...</p> 
      :
        <>
        <Button onClick={() => exportTodos()} className="mt-2 ml-auto mb-4 border border-black bg-white text-black hover:bg-white hover:text-black">Export Todos</Button>
        <div className="mt-5 mb-2 grid grid-cols-1 md:grid-cols-2 space-2">
            {todos?.map((todo) => (
              <Card key={todo.id} className="shadow-md rounded-lg p-4 bg-white m-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">{todo.title}</h3>
                  <Badge className={`badge ${todo.priority} border`}>{todo.priority}</Badge>
                </div>
                <p>{todo.description.length > 80 ? `${todo.description.substring(0, 80)}...` : todo.description}</p>
                <div className="flex flex-wrap mt-2">
                  {todo.tags?.map((tag, index) => (
                    <Badge key={index} className="m-1">{tag}</Badge>
                  ))}
                </div>
                <Dialog open={openDialogId === todo.id} onOpenChange={(open) => {
                  if (!open) setOpenDialogId(null);
                  else openEditDialog(todo);
                }}>
                  <DialogTrigger asChild>
                    <Button className="mt-2">Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>Edit Todo</DialogHeader>
                    <DialogDescription>
                      <Input
                        value={editTodoTitle}
                        onChange={(e) => setEditTodoTitle(e.target.value)}
                        placeholder="Edit title"
                        className="mb-2"
                      />
                      <Input
                        value={editTodoDescription}
                        onChange={(e) => setEditTodoDescription(e.target.value)}
                        placeholder="Edit description"
                        className="mb-2"
                      />
                      <Input
                        value={editTodoTags}
                        onChange={(e) => setEditTodoTags(e.target.value)}
                        placeholder="Edit tags (comma separated)"
                        className="mb-2"
                      />
                      <div className="flex gap-2 mt-4">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="Add new tag"
                        />
                        <Button onClick={() => addTag(todo.id, newTag)}>Add Tag</Button>
                      </div>
                      <div className="flex justify-between mt-4">
                        <Button variant="destructive" onClick={() => deleteTodo(todo.id)}>Delete</Button>
                        <Button onClick={() => updateTodo(todo.id, editTodoTitle, editTodoDescription, editTodoTags)}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogDescription>
                  </DialogContent>
                </Dialog>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <Button key={index} onClick={() => setCurrentPage(index + 1)} style={{ marginRight: '10px', backgroundColor: currentPage === index + 1 ? 'transparent' : '', color: currentPage === index + 1 ? 'black' : '', borderColor: currentPage === index + 1 ? 'black' : '' }}>
                {index + 1}
              </Button>
            ))}
          </div>
        </>
      }
    </div>
  );
}