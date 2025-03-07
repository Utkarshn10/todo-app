import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Toaster, toast } from "sonner";
import { Select } from "../components/ui/select";

export default function Login() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [userID, setUserID] = useState("Utkarshn10"); 
  const [description, setDescription] = useState(""); 
  const [priority, setPriority] = useState("Medium");
  const [tags, setTags] = useState(""); 

  const fetchTodos = async () => {
    try {
      const { data, error } = await fetch(`/api/todos?user_id=${userID}`);
      if (error) {
        throw new Error("Error fetching todos");
      }
      setTodos(await data.json()); // Update state with fetched todos
    } catch (error) {
      console.error(error);
      toast.error("Could not show todos"); // Show error as Sonner toast
    }
  };

  // Add useEffect to fetch todos on component mount
  useEffect(() => {
    fetchTodos(); 
  }, []); // Dependency array to fetch todos when userID changes

  const addTodo = async () => {
    const todo = {
      user_id: userID,
      title: newTodo,
      priority: priority, // Use the new priority state
      tags: tags.split(",").map(tag => tag.trim()), // Convert tags string to array
      description: description,
    };

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
      });

      if (!response.ok) {
        throw new Error("Error adding todo");
      }

      // Update the todos state directly
      setTodos((prevTodos) => [...prevTodos, todo]);
      setNewTodo(""); // Clear input after adding
      setDescription(""); // Clear description after adding
    } catch (error) {
      console.error(error);
      toast.error(error.message); // Show error as Sonner toast
    }
  };

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

      // Update the todos state directly
      setTodos((prevTodos) => prevTodos.filter(todo => todo.id !== todoID));
    } catch (error) {
      console.error(error);
      toast.error(error.message); // Show error as Sonner toast
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
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <Select.Option value="Low">Low</Select.Option>
          <Select.Option value="Medium">Medium</Select.Option>
          <Select.Option value="High">High</Select.Option>
        </Select>
        <Button onClick={addTodo}>Add Todo</Button>
      </div>
      <div>
        {todos.map((todo) => (
          <Card key={todo.id} onClick={() => {/* Logic to view todo details */}}>
            <h3>{todo.title}</h3>
            <p>{todo.description}</p>
            <div>
              <span className={`badge ${todo.priority}`}>{todo.priority}</span>
              {todo.tags.map((tag, index) => (
                <span key={index} className="badge">{tag}</span>
              ))}
            </div>
            <Button onClick={() => deleteTodo(todo.id)}>Delete</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
