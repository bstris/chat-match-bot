-- Adicionar coluna user_id à tabela n8n_chat_histories
ALTER TABLE public.n8n_chat_histories 
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para melhorar performance das queries filtradas por user_id
CREATE INDEX idx_n8n_chat_histories_user_id ON public.n8n_chat_histories(user_id);

-- Habilitar Row Level Security
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Política para SELECT: usuários só podem ver seu próprio histórico
CREATE POLICY "Users can view their own chat history"
ON public.n8n_chat_histories
FOR SELECT
USING (auth.uid() = user_id);

-- Política para INSERT: usuários só podem criar histórico para si mesmos
CREATE POLICY "Users can create their own chat history"
ON public.n8n_chat_histories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários só podem atualizar seu próprio histórico
CREATE POLICY "Users can update their own chat history"
ON public.n8n_chat_histories
FOR UPDATE
USING (auth.uid() = user_id);

-- Política para DELETE: usuários só podem deletar seu próprio histórico
CREATE POLICY "Users can delete their own chat history"
ON public.n8n_chat_histories
FOR DELETE
USING (auth.uid() = user_id);