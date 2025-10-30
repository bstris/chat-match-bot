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

  // Carregar favoritos do localStorage ao iniciar
  useEffect(() => {
    const stored = localStorage.getItem("chatFavorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
      }
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("chatFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = async (candidate: FavoriteCandidate, vagaId?: string) => {
    setLoading(true);
    try {
      // Verificar se já existe
      const exists = favorites.find(
        (f) =>
          f.sessionId === candidate.sessionId &&
          f.candidateIndex === candidate.candidateIndex
      );

      if (exists) {
        toast.info("Candidato já está nos favoritos");
        setLoading(false);
        return;
      }

      // Adicionar localmente
      setFavorites([...favorites, candidate]);

      // Se não tem vaga, abrir dialog para selecionar
      if (!vagaId) {
        setPendingCandidate(candidate);
        setShowVagaDialog(true);
        toast.success("Candidato adicionado aos favoritos locais!");
        setLoading(false);
        return;
      }

      // Salvar no Supabase se tem vaga
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.success("Candidato adicionado aos favoritos locais!");
        setLoading(false);
        return;
      }

      // Extrair candidato_id do campo id ou email/nome
      const candidatoId = parseInt(candidate.id) || Math.floor(Math.random() * 1000000);

      const { error } = await supabase
        .from('favoritos' as any)
        .insert({
          candidato_id: candidatoId,
          vaga_id: vagaId,
          recrutador_id: user.id
        });

      if (error) throw error;

      toast.success("Candidato adicionado aos favoritos!");
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

      const candidatoId = parseInt(pendingCandidate.id) || Math.floor(Math.random() * 1000000);

      const { error } = await supabase
        .from('favoritos' as any)
        .insert({
          candidato_id: candidatoId,
          vaga_id: vagaId,
          recrutador_id: user.id
        });

      if (error) throw error;

      toast.success("Candidato salvo em Meus Favoritos!");
      setPendingCandidate(null);
      setShowVagaDialog(false);
    } catch (error) {
      console.error("Erro ao salvar no Supabase:", error);
      toast.error("Erro ao salvar no banco");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = (sessionId: string, candidateIndex: number) => {
    setFavorites(
      favorites.filter(
        (f) =>
          !(f.sessionId === sessionId && f.candidateIndex === candidateIndex)
      )
    );
    toast.success("Candidato removido dos favoritos");
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
