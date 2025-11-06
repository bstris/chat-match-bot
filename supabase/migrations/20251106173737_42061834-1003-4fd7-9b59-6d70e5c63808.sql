-- Adicionar coluna compatibilidade na tabela chat_favoritos
ALTER TABLE chat_favoritos 
ADD COLUMN IF NOT EXISTS compatibilidade INTEGER DEFAULT 0;