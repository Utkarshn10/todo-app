import { supabase } from "@/utils/supabase";

const REQUIRED_COLS_TO_INSERT_TODO = [
  "id",
  "user_id",
  "title",
  "priority",
  "tags",
  "description",
];

export default async function handler(req, res) {
  // get todos for a user in descending order
  if (req.method === "GET") {
    const userID = req.query["user_id"];
    const limit = req.query["limit"] || 5;
    const offset = req.query["offset"] || 0;
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userID)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // add a todo
  if (req.method === "POST") {
    const todo = req.body;
    for (const col of REQUIRED_COLS_TO_INSERT_TODO) {
      if (!col in todo) {
        return res.status(400).json({ error: `Missing column: ${col}` });
      }
    }
    if (!todo.title || !todo.description) {
      return res.status(400).json({ error: "Title and description are compulsory" });
    }
    const { error } = await supabase.from("todos").insert(todo);

    if (!error) return res.status(200).json({ message: "Todo added" });
    else return res.status(500).json({ error: error });
  }

  // update a todo
  if (req.method === "PUT") {
    const { todoID, userID, ...updates } = req.body;
    if (!updates.title || !updates.description) {
      return res.status(400).json({ error: "Title and description are compulsory" });
    }
    const { error } = await supabase
      .from("todos")
      .update(updates)
      .eq("id", todoID)
      .eq("user_id", userID);

    if (!error) return res.status(200).json({ message: "Todo updated" });
    else return res.status(500).json({ error: error.message });
  }

  // delete a todo
  if (req.method === "DELETE") {
    const { todoID, userID } = req.body;
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", todoID)
      .eq("user_id", userID);

    if (!error) return res.status(200).json({ message: "Todo deleted" });
    else return res.status(500).json({ error: error.message });
  }
}
