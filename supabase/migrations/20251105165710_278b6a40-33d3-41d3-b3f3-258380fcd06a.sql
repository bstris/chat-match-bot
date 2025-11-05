-- Criar tabela para favoritos do chat (mensagens/candidatos da IA)
CREATE TABLE IF NOT EXISTS public.chat_favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recrutador_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  candidate_index INTEGER NOT NULL,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  link TEXT,
  resumo TEXT NOT NULL,
  vaga_id UUID REFERENCES public.vagas(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(recrutador_id, session_id, candidate_index)
);

-- Habilitar RLS
ALTER TABLE public.chat_favoritos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Recrutadores podem ver seus próprios favoritos do chat"
  ON public.chat_favoritos
  FOR SELECT
  USING (auth.uid() = recrutador_id);

CREATE POLICY "Recrutadores podem inserir favoritos do chat"
  ON public.chat_favoritos
  FOR INSERT
  WITH CHECK (auth.uid() = recrutador_id);

CREATE POLICY "Recrutadores podem deletar seus favoritos do chat"
  ON public.chat_favoritos
  FOR DELETE
  USING (auth.uid() = recrutador_id);

CREATE POLICY "Recrutadores podem atualizar seus favoritos do chat"
  ON public.chat_favoritos
  FOR UPDATE
  USING (auth.uid() = recrutador_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_chat_favoritos_updated_at
  BEFORE UPDATE ON public.chat_favoritos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();