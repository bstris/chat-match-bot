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

  const addFavorite = async (candidate: FavoriteCandidate) => {
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

      // Tentar salvar no Supabase (se houver vaga selecionada)
      // Por enquanto, apenas salvar localmente
      toast.success("Candidato adicionado aos favoritos!");
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      toast.error("Erro ao adicionar favorito");
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
  };
};
