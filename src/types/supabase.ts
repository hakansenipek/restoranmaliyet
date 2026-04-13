export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      hesaplamalar: {
        Row: {
          id: string
          user_id: string
          isletme_adi: string | null
          notlar: string | null
          girdi: Json
          sonuc: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          isletme_adi?: string | null
          notlar?: string | null
          girdi: Json
          sonuc: Json
        }
        Update: {
          isletme_adi?: string | null
          notlar?: string | null
          girdi?: Json
          sonuc?: Json
          updated_at?: string
        }
      }
    }
  }
}
