import { createClient } from '@/lib/supabase/client';
import type { FizibiliteGirdisi, FizibiliteSonucu } from '@/types/fizibilite';

export async function hesaplamayiKaydet(
  girdi: FizibiliteGirdisi,
  sonuc: FizibiliteSonucu
): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('fizibilite_hesaplamalar').upsert(
    {
      user_id: user.id,
      girdi: girdi as unknown as Record<string, unknown>,
      sonuc: sonuc as unknown as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

export async function hesaplamayiYukle(): Promise<{
  girdi: FizibiliteGirdisi;
  sonuc: FizibiliteSonucu;
} | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('fizibilite_hesaplamalar')
    .select('girdi, sonuc')
    .eq('user_id', user.id)
    .single();

  if (!data) return null;
  return {
    girdi: data.girdi as FizibiliteGirdisi,
    sonuc: data.sonuc as FizibiliteSonucu,
  };
}
