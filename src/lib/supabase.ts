import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_BUCKET!;

if (!supabaseUrl || !serviceKey || !bucket) {
  console.warn("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_BUCKET não definidos");
}

// client só pra uso no servidor (chave service role NUNCA vai pro front)
export const supabaseServer = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export async function uploadToSupabase(params: {
  buffer: Buffer;
  key: string;
  contentType: string;
}) {
  const { buffer, key, contentType } = params;

  const { error } = await supabaseServer.storage
    .from(bucket)
    .upload(key, buffer, {
      contentType,
      upsert: false, // não sobrescrever
    });

  if (error) {
    throw error;
  }

  const { data } = supabaseServer.storage.from(bucket).getPublicUrl(key);

  return {
    key,
    url: data.publicUrl,
  };
}

export async function downloadFromSupabase(key: string): Promise<Buffer> {
  const { data, error } = await supabaseServer.storage
    .from(bucket)
    .download(key);

  if (error) {
    throw error;
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
