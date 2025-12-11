
-- Create app_role enum if not exists
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'recruiter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    nome TEXT,
    avatar_url TEXT,
    aprovado BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create is_approved function
CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT aprovado FROM public.profiles WHERE id = _user_id),
    false
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create vagas table
CREATE TABLE IF NOT EXISTS public.vagas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    recrutador_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.vagas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vagas" ON public.vagas
    FOR SELECT USING (auth.uid() = recrutador_id);

CREATE POLICY "Users can insert their own vagas" ON public.vagas
    FOR INSERT WITH CHECK (auth.uid() = recrutador_id);

CREATE POLICY "Users can update their own vagas" ON public.vagas
    FOR UPDATE USING (auth.uid() = recrutador_id);

CREATE POLICY "Users can delete their own vagas" ON public.vagas
    FOR DELETE USING (auth.uid() = recrutador_id);

-- Create chat_favoritos table
CREATE TABLE IF NOT EXISTS public.chat_favoritos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vaga_id UUID REFERENCES public.vagas(id) ON DELETE CASCADE NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT,
    candidate_phone TEXT,
    candidate_location TEXT,
    candidate_education TEXT,
    candidate_experience TEXT,
    compatibility_percentage INTEGER,
    profile_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chat_favoritos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat_favoritos" ON public.chat_favoritos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat_favoritos" ON public.chat_favoritos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat_favoritos" ON public.chat_favoritos
    FOR DELETE USING (auth.uid() = user_id);

-- Create n8n_chat_histories table
CREATE TABLE IF NOT EXISTS public.n8n_chat_histories (
    id SERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat history" ON public.n8n_chat_histories
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat history" ON public.n8n_chat_histories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat history" ON public.n8n_chat_histories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat history" ON public.n8n_chat_histories
    FOR DELETE USING (auth.uid() = user_id);

-- Create filtros_personalizados table
CREATE TABLE IF NOT EXISTS public.filtros_personalizados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nome TEXT NOT NULL,
    filtros JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.filtros_personalizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own filters" ON public.filtros_personalizados
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filters" ON public.filtros_personalizados
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters" ON public.filtros_personalizados
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters" ON public.filtros_personalizados
    FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for automatic profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data ->> 'nome');
  
  -- Assign default recruiter role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'recruiter');
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_vagas_updated_at ON public.vagas;
CREATE TRIGGER update_vagas_updated_at
    BEFORE UPDATE ON public.vagas
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
