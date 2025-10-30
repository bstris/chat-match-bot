-- Criar tabela para favoritos do chat
CREATE TABLE IF NOT EXISTS public.chat_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  candidate_id text NOT NULL,
  nome text NOT NULL,
  email text,
  telefone text,
  link text,
  resumo text,
  session_id text NOT NULL,
  candidate_index integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, session_id, candidate_index)
);

-- Habilitar RLS
ALTER TABLE public.chat_favorites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own chat favorites"
  ON public.chat_favorites
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat favorites"
  ON public.chat_favorites
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat favorites"
  ON public.chat_favorites
  FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para melhorar performance
CREATE INDEX idx_chat_favorites_user_id ON public.chat_favorites(user_id);
CREATE INDEX idx_chat_favorites_session_id ON public.chat_favorites(session_id);