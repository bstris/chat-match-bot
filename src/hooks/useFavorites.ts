import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FavoriteCandidate {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  link: string;
  resumo: string;
  sessionId: string;
  candidateIndex: number;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingCandidate, setPendingCandidate] = useState<FavoriteCandidate | null>(null);
  const [showVagaDialog, setShowVagaDialog] = useState(false);

  // Carregar favoritos do Supabase ao iniciar
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('chat_favoritos' as any)
        .select('*')
        .eq('recrutador_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const mappedFavorites: FavoriteCandidate[] = data.map((fav: any) => ({
          id: fav.id,
          nome: fav.nome,
          email: fav.email || '',
          telefone: fav.telefone || '',
          link: fav.link || '',
          resumo: fav.resumo,
          sessionId: fav.session_id,
          candidateIndex: fav.candidate_index
        }));
        setFavorites(mappedFavorites);
      }
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
  };

  const addFavorite = async (candidate: FavoriteCandidate, vagaId?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado para favoritar");
        setLoading(false);
        return;
      }

      // Verificar se já existe no Supabase
      const { data: existing } = await supabase
        .from('chat_favoritos' as any)
        .select('id')
        .eq('recrutador_id', user.id)
        .eq('session_id', candidate.sessionId)
        .eq('candidate_index', candidate.candidateIndex)
        .limit(1);

      if (existing && existing.length > 0) {
        toast.info("Candidato já está nos favoritos");
        setLoading(false);
        return;
      }

      // Se não tem vaga, abrir dialog para selecionar
      if (!vagaId) {
        setPendingCandidate(candidate);
        setShowVagaDialog(true);
        setLoading(false);
        return;
      }

      // Salvar no Supabase
      const { error } = await supabase
        .from('chat_favoritos' as any)
        .insert({
          recrutador_id: user.id,
          session_id: candidate.sessionId,
          candidate_index: candidate.candidateIndex,
          nome: candidate.nome,
          email: candidate.email,
          telefone: candidate.telefone,
          link: candidate.link,
          resumo: candidate.resumo,
          vaga_id: vagaId
        });

      if (error) throw error;

      toast.success("Candidato adicionado aos favoritos!");
      await loadFavorites(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      toast.error("Erro ao adicionar favorito no banco");
    } finally {
      setLoading(false);
    }
  };

  const saveToSupabase = async (vagaId: string) => {
    if (!pendingCandidate) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { error } = await supabase
        .from('chat_favoritos' as any)
        .insert({
          recrutador_id: user.id,
          session_id: pendingCandidate.sessionId,
          candidate_index: pendingCandidate.candidateIndex,
          nome: pendingCandidate.nome,
          email: pendingCandidate.email,
          telefone: pendingCandidate.telefone,
          link: pendingCandidate.link,
          resumo: pendingCandidate.resumo,
          vaga_id: vagaId
        });

      if (error) throw error;

      toast.success("Candidato salvo em Meus Favoritos!");
      setPendingCandidate(null);
      setShowVagaDialog(false);
      await loadFavorites(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error);
      toast.error("Erro ao salvar no banco");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (sessionId: string, candidateIndex: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Você precisa estar logado");
        return;
      }

      const { error } = await supabase
        .from('chat_favoritos' as any)
        .delete()
        .eq('recrutador_id', user.id)
        .eq('session_id', sessionId)
        .eq('candidate_index', candidateIndex);

      if (error) throw error;

      toast.success("Candidato removido dos favoritos");
      await loadFavorites(); // Recarregar lista
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Erro ao remover favorito");
    }
  };

  const isFavorited = (sessionId: string, candidateIndex: number) => {
    return favorites.some(
      (f) => f.sessionId === sessionId && f.candidateIndex === candidateIndex
    );
  };

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorited,
    loading,
    showVagaDialog,
    setShowVagaDialog,
    saveToSupabase,
  };
};
