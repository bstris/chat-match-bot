# Documentação Técnica do Projeto

## Sumário

1. [Arquitetura do Supabase](#1-arquitetura-do-supabase)
   - 1.1 [Tabelas](#11-tabelas)
   - 1.2 [Funções RPC](#12-funções-rpc)
   - 1.3 [Conexões e Instâncias](#13-conexões-e-instâncias)
2. [Fluxos de Autenticação](#2-fluxos-de-autenticação)
3. [Mapa de Interação Entre Telas](#3-mapa-de-interação-entre-telas)
4. [Mapa Geral de Integração](#4-mapa-geral-de-integração)

---

## 1. Arquitetura do Supabase

### 1.1 Tabelas

#### 1.1.1 `candidatos`

**Descrição:** Armazena informações dos candidatos com embeddings vetoriais para busca semântica.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | bigint | Não | auto | Identificador único |
| content | text | Sim | - | Conteúdo textual do candidato |
| metadata | jsonb | Sim | - | Metadados (nome, email, telefone, formações, etc.) |
| embedding | vector | Sim | - | Vetor de embedding para busca semântica |

**RLS:** Desabilitado (sem políticas configuradas)

**Relacionamentos:** Nenhum

**Uso no código:**
- Consultada via funções RPC `supabase_candidato()` e `candidato_dinamico()`
- Utilizada em `ChatArea.tsx` para buscar candidatos baseados em critérios

---

#### 1.1.2 `chat_favoritos`

**Descrição:** Armazena candidatos favoritados durante sessões de chat específicas.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | uuid | Não | gen_random_uuid() | Identificador único |
| session_id | text | Não | - | ID da sessão de chat |
| recrutador_id | uuid | Não | - | ID do recrutador (auth.users) |
| nome | text | Não | - | Nome do candidato |
| resumo | text | Não | - | Resumo do candidato |
| email | text | Sim | - | Email do candidato |
| telefone | text | Sim | - | Telefone do candidato |
| link | text | Sim | - | Link externo |
| compatibilidade | integer | Sim | 0 | Score de compatibilidade |
| vaga_id | uuid | Sim | - | Referência à vaga |
| candidate_index | integer | Não | - | Índice do candidato |
| created_at | timestamptz | Sim | now() | Data de criação |
| updated_at | timestamptz | Sim | now() | Data de atualização |

**RLS:** Habilitado

**Políticas:**
- `SELECT`: Recrutadores podem ver seus próprios favoritos (`auth.uid() = recrutador_id`)
- `INSERT`: Recrutadores podem inserir favoritos (`auth.uid() = recrutador_id`)
- `UPDATE`: Recrutadores podem atualizar seus favoritos (`auth.uid() = recrutador_id`)
- `DELETE`: Recrutadores podem deletar seus favoritos (`auth.uid() = recrutador_id`)

**Uso no código:**
- `ChatFavorites.tsx`: Carrega e exibe favoritos do chat
- `ChatFavoriteVagaDialog.tsx`: Salva candidatos como favoritos
- `useFavorites.ts`: Hook customizado para gerenciar favoritos

---

#### 1.1.3 `chat_memory`

**Descrição:** Armazena memória de contexto de conversas (uso legado/alternativo).

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | integer | Não | nextval | Identificador único |
| session_id | varchar | Sim | - | ID da sessão |
| message | jsonb | Sim | - | Conteúdo da mensagem |

**RLS:** Desabilitado

**Uso no código:** Não utilizada ativamente no código frontend

---

#### 1.1.4 `documents`

**Descrição:** Armazena documentos com embeddings para busca vetorial.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | bigint | Não | nextval | Identificador único |
| content | text | Sim | - | Conteúdo do documento |
| metadata | jsonb | Sim | - | Metadados adicionais |
| embedding | vector | Sim | - | Vetor de embedding |

**RLS:** Desabilitado

**Funções relacionadas:** `match_documents()`

---

#### 1.1.5 `filtros_personalizados`

**Descrição:** Armazena filtros customizados criados pelos recrutadores.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | uuid | Não | gen_random_uuid() | Identificador único |
| recrutador_id | uuid | Não | - | ID do recrutador |
| nome | text | Não | - | Nome do filtro |
| criterios | jsonb | Não | - | Critérios do filtro |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**RLS:** Habilitado

**Políticas:**
- `SELECT`: Recrutadores veem seus próprios filtros
- `INSERT`: Recrutadores podem criar filtros
- `UPDATE`: Recrutadores podem atualizar seus filtros
- `DELETE`: Recrutadores podem deletar seus filtros

**Uso no código:**
- `CustomFiltersDialog.tsx`: Gerencia filtros personalizados

---

#### 1.1.6 `mec_instituicoes`

**Descrição:** Dados do MEC sobre instituições de ensino e cursos.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | uuid | Não | gen_random_uuid() | Identificador único |
| codigo_ies | text | Não | - | Código da instituição |
| nome_ies | text | Não | - | Nome da instituição |
| sigla_ies | text | Sim | - | Sigla da instituição |
| uf | text | Sim | - | Estado |
| municipio | text | Sim | - | Cidade |
| categoria_administrativa | text | Sim | - | Categoria |
| organizacao_academica | text | Sim | - | Organização acadêmica |
| cursos | jsonb | Sim | []::jsonb | Lista de cursos |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**RLS:** Habilitado

**Políticas:**
- `SELECT`: Todos usuários autenticados podem ver
- `INSERT/UPDATE/DELETE`: Apenas admins (`has_role(auth.uid(), 'admin')`)

**Uso no código:**
- `MecData.tsx`: Exibe e gerencia dados do MEC
- Edge Function `validate-mec/index.ts`: Valida formação acadêmica

---

#### 1.1.7 `n8n_chat_histories`

**Descrição:** Histórico de mensagens de chat integrado com N8N.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | integer | Não | nextval | Identificador único |
| session_id | varchar | Não | - | ID da sessão de chat |
| user_id | uuid | Sim | - | ID do usuário (auth.users) |
| session_key | varchar | Sim | - | Chave composta da sessão |
| message | jsonb | Não | - | Conteúdo da mensagem |

**RLS:** Habilitado

**Políticas:**
- `SELECT`: Usuários veem apenas seu histórico (`auth.uid() = user_id`)
- `INSERT`: Usuários criam histórico para si (`auth.uid() = user_id`)
- `UPDATE`: Usuários atualizam seu histórico (`auth.uid() = user_id`)
- `DELETE`: Usuários deletam seu histórico (`auth.uid() = user_id`)

**Índices:**
- `idx_n8n_chat_histories_user_id` em `user_id`

**Uso no código:**
- `ChatArea.tsx`: Salva e carrega mensagens
- `ChatSidebar.tsx`: Lista histórico de conversas

---

#### 1.1.8 `profiles`

**Descrição:** Perfis de usuários vinculados a contas de autenticação.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | uuid | Não | - | ID do usuário (auth.users) |
| nome | text | Não | - | Nome completo |
| primeiro_nome | text | Sim | - | Primeiro nome |
| sobrenome | text | Sim | - | Sobrenome |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**RLS:** Habilitado

**Políticas:**
- `SELECT`: Usuários veem seu próprio perfil (`auth.uid() = id`)
- `INSERT`: Usuários criam seu perfil (`auth.uid() = id`)
- `UPDATE`: Usuários atualizam seu perfil (`auth.uid() = id`)
- `DELETE`: Bloqueado

**Trigger:**
- `on_auth_user_created`: Cria perfil automaticamente ao cadastrar usuário

**Uso no código:**
- `Index.tsx`: Carrega nome do usuário
- `Login.tsx`: Envia dados ao criar conta

---

#### 1.1.9 `user_roles`

**Descrição:** Gerenciamento de papéis (roles) de usuários.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | uuid | Não | gen_random_uuid() | Identificador único |
| user_id | uuid | Não | - | ID do usuário |
| role | app_role (enum) | Não | - | Papel: 'admin' ou 'recruiter' |
| created_at | timestamptz | Não | now() | Data de criação |

**RLS:** Habilitado

**Políticas:**
- `SELECT`: Admins veem todos / Usuários veem seus próprios
- `INSERT/DELETE`: Apenas admins
- `UPDATE`: Bloqueado

**Uso no código:**
- Utilizado via função `has_role()` em políticas RLS
- Referenciado em `is_approved()` para verificar aprovação

---

#### 1.1.10 `vagas`

**Descrição:** Vagas de emprego criadas por recrutadores.

**Estrutura:**
| Coluna | Tipo | Nullable | Default | Descrição |
|--------|------|----------|---------|-----------|
| id | uuid | Não | gen_random_uuid() | Identificador único |
| recrutador_id | uuid | Não | - | ID do recrutador |
| titulo | text | Não | - | Título da vaga |
| created_at | timestamptz | Não | now() | Data de criação |
| updated_at | timestamptz | Não | now() | Data de atualização |

**RLS:** Habilitado

**Políticas:**
- `SELECT/INSERT/UPDATE/DELETE`: Recrutadores gerenciam suas vagas

**Uso no código:**
- `FavoriteVagaDialog.tsx`: Seleciona vaga ao favoritar candidato
- `ChatFavoriteVagaDialog.tsx`: Associa candidatos a vagas

---

### 1.2 Funções RPC

#### 1.2.1 `handle_new_user()`

**Tipo:** Trigger Function

**Descrição:** Cria automaticamente um registro na tabela `profiles` quando um novo usuário é criado em `auth.users`.

**Parâmetros:** Trigger (NEW)

**Retorno:** Trigger

**SQL:**
```sql
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, primeiro_nome, sobrenome)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'primeiro_nome', ''),
    COALESCE(NEW.raw_user_meta_data->>'sobrenome', '')
  );
  RETURN NEW;
END;
$$;
```

**Uso:** Trigger `on_auth_user_created` em `auth.users`

---

#### 1.2.2 `has_role(user_id uuid, role app_role)`

**Descrição:** Verifica se um usuário possui um papel específico.

**Parâmetros:**
- `_user_id`: UUID do usuário
- `_role`: Papel a verificar ('admin' ou 'recruiter')

**Retorno:** `boolean`

**SQL:**
```sql
CREATE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

**Uso:** Políticas RLS em `mec_instituicoes`, `user_roles`

---

#### 1.2.3 `is_approved(user_id uuid)`

**Descrição:** Verifica se um usuário foi aprovado (possui algum papel).

**Parâmetros:**
- `_user_id`: UUID do usuário

**Retorno:** `boolean`

**SQL:**
```sql
CREATE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id
  )
$$;
```

---

#### 1.2.4 `candidato_dinamico(...)`

**Descrição:** Busca candidatos usando embeddings vetoriais e filtros dinâmicos.

**Parâmetros:**
- `query_embedding`: vector - Embedding da consulta
- `qtd`: integer - Quantidade de resultados (padrão: 5)
- `nome`, `endereco`, `email`, `data_nascimento`, `telefone`, `perfil`, `formacoes`, `experiencias`, `idiomas`: text (opcionais)

**Retorno:** Tabela com `id`, `content`, `metadata`, `similaridade`

**Uso no código:**
- `ChatArea.tsx`: Busca candidatos baseada em critérios

---

#### 1.2.5 `match_documents(query_embedding, match_count, filter)`

**Descrição:** Busca documentos similares usando embeddings.

**Parâmetros:**
- `query_embedding`: vector
- `match_count`: integer (opcional)
- `filter`: jsonb (padrão: `{}`)

**Retorno:** Tabela com `id`, `content`, `metadata`, `similarity`

---

### 1.3 Conexões e Instâncias

#### Inicialização do Supabase

**Arquivo:** `src/integrations/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nqnwlvrnnqweljibarfg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

**Serviços Utilizados:**

1. **Auth** (Autenticação)
   - Login/Cadastro
   - Recuperação de senha
   - Gerenciamento de sessão
   - Usado em: `Login.tsx`, `ProtectedRoute.tsx`, `Index.tsx`

2. **Database** (Banco de Dados)
   - Consultas via `.from()`
   - Funções RPC via `.rpc()`
   - Usado em: Todos os componentes que interagem com dados

3. **Storage** (Armazenamento)
   - Bucket `bucket1` (público)
   - Uso não identificado no código frontend atual

4. **Edge Functions** (Funções Serverless)
   - `validate-mec`: Valida formação acadêmica usando Azure OpenAI

5. **Realtime** (Tempo Real)
   - Não utilizado explicitamente no código

---

## 2. Fluxos de Autenticação

### 2.1 Cadastro (Sign Up)

**Tela:** `src/pages/Login.tsx`

**Fluxo:**

```
[Usuário] → Preenche formulário (email, senha, primeiro_nome, sobrenome)
          ↓
[Login.tsx - handleAuth()] → Valida campos
          ↓
[supabase.auth.signUp()] → Cria usuário em auth.users
          ↓
[Trigger: on_auth_user_created] → Chama handle_new_user()
          ↓
[handle_new_user()] → Cria registro em profiles
          ↓
[Redirect] → Redireciona para "/"
```

**Código (Login.tsx):**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    emailRedirectTo: `${window.location.origin}/`,
    data: {
      primeiro_nome: formData.firstName,
      sobrenome: formData.lastName,
      nome: `${formData.firstName} ${formData.lastName}`
    }
  }
});
```

**Tabelas afetadas:**
- `auth.users` (inserção)
- `profiles` (inserção via trigger)

**Validações:**
- Email obrigatório
- Senha mínima de 6 caracteres
- Confirmação de senha

---

### 2.2 Login (Sign In)

**Tela:** `src/pages/Login.tsx`

**Fluxo:**

```
[Usuário] → Preenche email e senha
          ↓
[Login.tsx - handleAuth()] → Valida campos
          ↓
[supabase.auth.signInWithPassword()] → Autentica usuário
          ↓
[ProtectedRoute.tsx] → Verifica sessão
          ↓
[Redirect] → Redireciona para "/"
```

**Código:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: formData.email,
  password: formData.password,
});
```

**Persistência de Sessão:**
- Configurada em `client.ts` com `localStorage`
- `persistSession: true`
- `autoRefreshToken: true`

**Tratamento de Erros:**
- Credenciais inválidas
- Usuário não confirmado
- Exibição via `toast`

---

### 2.3 Recuperação de Senha (Reset Password)

**Tela:** `src/pages/Login.tsx`

**Fluxo Completo:**

```
[Passo 1: Solicitar Reset]
[Usuário] → Clica "Esqueceu a senha?" → Insere email
          ↓
[supabase.auth.resetPasswordForEmail()] → Envia email com link
          ↓
[Email recebido] → Contém link com token

[Passo 2: Redefinir Senha]
[Usuário] → Clica no link do email
          ↓
[Redirect] → /login?type=recovery&...
          ↓
[useEffect] → Detecta ?type=recovery → Define mode='update-password'
          ↓
[Formulário] → Exibe campos "Nova Senha" e "Confirmar Senha"
          ↓
[handleAuth()] → supabase.auth.updateUser({ password: newPassword })
          ↓
[Sucesso] → Redireciona para "/"
```

**Código (Solicitar Reset):**
```typescript
await supabase.auth.resetPasswordForEmail(formData.email, {
  redirectTo: `${window.location.origin}/login?type=recovery`,
});
```

**Código (Atualizar Senha):**
```typescript
const { error } = await supabase.auth.updateUser({
  password: formData.newPassword
});
```

**Endpoints Chamados:**
- `POST /auth/v1/recover` - Envia email
- `PUT /auth/v1/user` - Atualiza senha

---

## 3. Mapa de Interação Entre Telas

### Diagrama de Navegação

```
[/login] ────────────────────┐
   │                         │
   │ Login bem-sucedido      │ Sem autenticação
   ↓                         ↓
[/] (Dashboard)          [ProtectedRoute]
   │                         │
   ├──→ [/favorites]         │
   │    (Meus Favoritos)     │
   │                         │
   ├──→ [/chat-favorites]    │
   │    (Favoritos do Chat)  │
   │                         │
   ├──→ [/mec-data]          │
   │    (Dados MEC)          │
   │                         │
   └──→ [Logout] ────────────┘
```

---

### 3.1 `/login` - Tela de Login/Cadastro

**Arquivo:** `src/pages/Login.tsx`

**Função:** Autenticação de usuários (login, cadastro, recuperação de senha)

**Ações do Usuário:**
- Fazer login
- Criar conta
- Solicitar recuperação de senha
- Redefinir senha (quando vindo do email)

**Chamadas Supabase:**
- `supabase.auth.signInWithPassword()` - Login
- `supabase.auth.signUp()` - Cadastro
- `supabase.auth.resetPasswordForEmail()` - Reset
- `supabase.auth.updateUser()` - Atualizar senha

**Estado:**
- `formData`: { email, password, firstName, lastName, newPassword, confirmPassword }
- `mode`: 'login' | 'signup' | 'reset' | 'update-password'
- `isLoading`: boolean

**Requer Autenticação:** Não

**Navegação:**
- Sucesso → `/`
- Já autenticado → Redireciona para `/`

---

### 3.2 `/` - Dashboard Principal

**Arquivo:** `src/pages/Index.tsx`

**Função:** Interface principal de busca de candidatos via chat com IA

**Ações do Usuário:**
- Conversar com IA sobre requisitos de vaga
- Visualizar candidatos compatíveis
- Favoritar candidatos
- Navegar para outras telas
- Fazer logout

**Componentes:**
- `ChatSidebar`: Histórico de conversas
- `ChatArea`: Área de chat com IA
- `CandidateResults`: Lista de candidatos encontrados
- `FavoriteVagaSelector`: Dialog para favoritar

**Chamadas Supabase:**
- `supabase.auth.getUser()` - Obter usuário
- `supabase.from('profiles').select('primeiro_nome')` - Nome do usuário
- `supabase.auth.signOut()` - Logout

**Estado:**
- `selectedSessionId`: ID da sessão de chat ativa
- `showResults`: boolean - Exibir resultados
- `userName`: Nome do usuário logado
- `candidates`: Lista de candidatos

**Requer Autenticação:** Sim (ProtectedRoute)

**Navegação:**
- `/favorites` - Meus Favoritos
- `/mec-data` - Dados MEC
- `/login` - Logout

---

### 3.3 `/favorites` - Meus Favoritos

**Arquivo:** `src/pages/Favorites.tsx`

**Função:** Exibir todos os candidatos favoritados pelo recrutador

**Ações do Usuário:**
- Visualizar lista de favoritos
- Remover favoritos
- Ver detalhes de candidatos
- Voltar para dashboard

**Chamadas Supabase:**
- `supabase.from('chat_favoritos').select('*').eq('recrutador_id', userId)` - Lista favoritos

**Estado:**
- `favorites`: Array de candidatos favoritados

**Requer Autenticação:** Sim

**Navegação:**
- `/` - Voltar (botão)

---

### 3.4 `/chat-favorites` - Favoritos do Chat

**Arquivo:** `src/pages/ChatFavorites.tsx`

**Função:** Exibir favoritos de uma sessão de chat específica

**Ações do Usuário:**
- Visualizar candidatos favoritados na sessão
- Gerenciar favoritos por sessão

**Chamadas Supabase:**
- `supabase.from('chat_favoritos').select('*').eq('session_id', sessionId)` - Favoritos da sessão

**Estado:**
- `favorites`: Array filtrado por sessão

**Requer Autenticação:** Sim

---

### 3.5 `/mec-data` - Dados do MEC

**Arquivo:** `src/pages/MecData.tsx`

**Função:** Gerenciar dados de instituições e cursos do MEC

**Ações do Usuário:**
- Visualizar instituições cadastradas
- Buscar por instituições
- Adicionar/editar/remover dados (se admin)

**Chamadas Supabase:**
- `supabase.from('mec_instituicoes').select('*')` - Listar instituições
- `supabase.from('mec_instituicoes').insert()` - Adicionar (admin)
- `supabase.from('mec_instituicoes').update()` - Editar (admin)
- `supabase.from('mec_instituicoes').delete()` - Remover (admin)

**Estado:**
- `instituicoes`: Lista de instituições
- `filters`: Filtros de busca

**Requer Autenticação:** Sim
**Requer Admin:** Para operações de escrita

---

### 3.6 Componente: `ProtectedRoute`

**Arquivo:** `src/components/ProtectedRoute.tsx`

**Função:** HOC que protege rotas privadas

**Lógica:**
```typescript
1. Configura listener de auth state
2. Verifica sessão existente
3. Se não autenticado → Redireciona para /login
4. Se autenticado → Renderiza children
```

**Chamadas Supabase:**
- `supabase.auth.onAuthStateChange()` - Listener
- `supabase.auth.getSession()` - Verificação inicial

---

## 4. Mapa Geral de Integração

### 4.1 Fluxo: Busca de Candidatos

```
[Tela: /]
   │
   ├─ [ChatArea.tsx]
   │     │
   │     ├─ Usuário envia mensagem
   │     │
   │     ├─ [POST] https://engeform.up.railway.app/webhook/... (N8N)
   │     │     └─ Processa requisitos da vaga
   │     │
   │     ├─ [Supabase RPC] candidato_dinamico(embedding, filtros)
   │     │     │
   │     │     └─ [Tabela: candidatos]
   │     │           └─ Busca vetorial + filtros
   │     │
   │     └─ Retorna candidatos → [CandidateResults]
   │
   └─ [Usuário] Favorita candidato
         │
         ├─ [FavoriteVagaSelector] → Seleciona vaga
         │
         └─ [Supabase] .from('chat_favoritos').insert()
               │
               └─ [Tabela: chat_favoritos]
                     └─ RLS: verifica recrutador_id = auth.uid()
```

---

### 4.2 Fluxo: Autenticação Completa

```
[Cadastro]
  Login.tsx → signUp() → auth.users → [Trigger] → profiles
                              │
                              └─ Envia email de confirmação

[Login]
  Login.tsx → signInWithPassword() → Cria sessão
                              │
                              └─ [ProtectedRoute] → Permite acesso

[Recuperação]
  Login.tsx → resetPasswordForEmail() → Email com link
                              │
                              ↓
  Usuário clica link → /login?type=recovery
                              │
                              ↓
  Login.tsx (mode=update-password) → updateUser()
                              │
                              └─ Redireciona para /
```

---

### 4.3 Fluxo: Histórico de Chat

```
[ChatArea.tsx]
   │
   ├─ Usuário envia mensagem
   │     │
   │     └─ [Supabase] .from('n8n_chat_histories').insert({
   │           session_id,
   │           user_id: auth.uid(),
   │           message: {...}
   │        })
   │
[ChatSidebar.tsx]
   │
   └─ Carrega histórico
         │
         └─ [Supabase] .from('n8n_chat_histories')
                       .select()
                       .eq('user_id', auth.uid())
                       └─ RLS: Filtra por user_id automaticamente
```

---

### 4.4 Fluxo: Validação MEC (Edge Function)

```
[ChatArea ou Frontend]
   │
   └─ [POST] /functions/v1/validate-mec
         │
         ├─ Body: { candidateEducation, jobRequirements }
         │
         └─ [Edge Function: validate-mec]
               │
               ├─ [Supabase] .from('mec_instituicoes').select()
               │     └─ Busca dados de instituições
               │
               ├─ [Azure OpenAI API] Valida formação
               │
               └─ Retorna: { isValid, score, institution, course, observations }
```

---

## 5. Segredos e Configurações

### Secrets Configurados no Supabase

| Secret | Uso |
|--------|-----|
| `SUPABASE_ANON_KEY` | Chave pública do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço (Edge Functions) |
| `SUPABASE_PUBLISHABLE_KEY` | Chave publicável |
| `AZURE_OPENAI_API_KEY` | API Azure OpenAI (validate-mec) |
| `SUPABASE_DB_URL` | URL do banco de dados |
| `SUPABASE_URL` | URL do projeto Supabase |

### Variáveis de Ambiente (Frontend)

**Arquivo:** `.env`
```
VITE_SUPABASE_PROJECT_ID="nqnwlvrnnqweljibarfg"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGci..."
VITE_SUPABASE_URL="https://nqnwlvrnnqweljibarfg.supabase.co"
```

---

## 6. Hooks Customizados

### `useFavorites.ts`

**Descrição:** Gerencia favoritos (adicionar, remover, listar)

**Funções:**
- `addFavorite(candidate, sessionId)` - Adiciona candidato aos favoritos
- `removeFavorite(candidateId)` - Remove favorito
- `favorites` - Lista de favoritos

**Chamadas Supabase:**
- `.from('chat_favoritos').insert()`
- `.from('chat_favoritos').delete()`

---

## 7. Segurança e RLS

### Resumo de Políticas RLS

| Tabela | Restrição |
|--------|-----------|
| `candidatos` | Sem RLS (acesso livre) |
| `chat_favoritos` | Por recrutador (`recrutador_id = auth.uid()`) |
| `filtros_personalizados` | Por recrutador |
| `mec_instituicoes` | Leitura: todos / Escrita: admins |
| `n8n_chat_histories` | Por usuário (`user_id = auth.uid()`) |
| `profiles` | Próprio perfil apenas |
| `user_roles` | Leitura: próprio ou admin / Escrita: admin |
| `vagas` | Por recrutador |

### Funções de Segurança

- `has_role(user_id, role)`: Verifica papel do usuário (SECURITY DEFINER)
- `is_approved(user_id)`: Verifica se usuário foi aprovado

---

## 8. Integrações Externas

### N8N Webhook

**URL:** `https://engeform.up.railway.app/webhook/f6828a64-e683-4e53-a1b3-f4b149caf760`

**Uso:** Processamento de mensagens de chat e extração de requisitos de vaga

**Payload:**
```json
{
  "action": "message",
  "sessionId": "uuid",
  "chatId": "uuid",
  "message": "texto do usuário"
}
```

**Resposta:**
```json
{
  "output": "resposta da IA",
  "filters": { ... }
}
```

---

## 9. Schemas e Tipos

**Arquivo:** `src/integrations/supabase/types.ts`

Gerado automaticamente pelo Supabase CLI, contém:
- Interfaces TypeScript para todas as tabelas
- Tipos `Row`, `Insert`, `Update` para cada tabela
- Enums (`app_role`: 'admin' | 'recruiter')
- Tipos de funções RPC

**Exemplo:**
```typescript
export type Tables<TableName extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][TableName]['Row'];

type Profile = Tables<'profiles'>;
// { id: string, nome: string, primeiro_nome: string | null, ... }
```

---

## 10. Observações e Boas Práticas

### Autenticação
- ✅ RLS habilitado em tabelas sensíveis
- ✅ Uso de `SECURITY DEFINER` em funções de verificação de role
- ✅ Políticas restringem acesso por `auth.uid()`
- ⚠️ Tabela `candidatos` sem RLS (verificar se é intencional)

### Performance
- ✅ Índices em `user_id` para tabelas com RLS
- ✅ Uso de embeddings vetoriais para busca semântica
- ⚠️ Considerar paginação em listas grandes

### Manutenção
- ✅ Triggers automatizam criação de perfis
- ✅ Campos `updated_at` com trigger
- ⚠️ Tabelas `chat_memory`, `documents_copy`, `login`, `tabelateste` parecem legadas/não utilizadas

---

**Fim da Documentação Técnica**

*Documento gerado em: 2025*
*Projeto: Sistema de Recrutamento com IA*
*Versão: 1.0*
