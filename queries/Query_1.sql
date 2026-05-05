ALTER TABLE public.ai_chat_logs
    ADD COLUMN IF NOT EXISTS chat_id UUID NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS idx_ai_chat_logs_user_id_chat_id_created_at
    ON public.ai_chat_logs (user_id, chat_id, created_at DESC);