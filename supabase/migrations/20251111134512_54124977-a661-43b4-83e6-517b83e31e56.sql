-- Adicionar coluna session_key na tabela n8n_chat_histories
ALTER TABLE n8n_chat_histories 
ADD COLUMN IF NOT EXISTS session_key VARCHAR;

-- Criar índice para melhorar performance nas consultas
CREATE INDEX IF NOT EXISTS idx_n8n_chat_histories_session_key 
ON n8n_chat_histories(session_key);

-- Migrar dados existentes: combinar session_id com um chat-id padrão para registros antigos
UPDATE n8n_chat_histories 
SET session_key = session_id || '_legacy'
WHERE session_key IS NULL;