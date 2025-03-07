import { supabase } from "@/utils/supabase";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const userID = req.query["user_id"];
    const { data, error } = await supabase
    .from("todos")
    .select('count')
    .eq("user_id", userID)
    .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }
}