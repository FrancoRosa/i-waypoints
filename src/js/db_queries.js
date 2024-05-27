import { createClient } from "@supabase/supabase-js";
import { credentials } from "./db_credentials";
const supabase = createClient(credentials.url, credentials.annon);

export const getAuthenticate = async (name, password) => {
        const { data } = await supabase.from("users").select().eq('name', name).eq('pass', password);
        console.log(data)
        return data
}

