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
  const [userId, setUserId] = useState<string | null>(null);

  // Verificar autenticação e carregar favoritos
  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      
      if (session?.user?.id) {
        await loadFavoritesFromSupabase(session.user.id);
      } else {
        // Carregar do localStorage se não estiver autenticado
        loadFavoritesFromLocalStorage();
      }
    };

    initAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUserId(session?.user?.id || null);
        if (session?.user?.id) {
          await loadFavoritesFromSupabase(session.user.id);
        } else {
          loadFavoritesFromLocalStorage();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Carregar favoritos do Supabase
  const loadFavoritesFromSupabase = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_favorites")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const loadedFavorites: FavoriteCandidate[] = (data || []).map((item: any) => ({
        id: item.candidate_id,
        nome: item.nome,
        email: item.email || "",
        telefone: item.telefone || "",
        link: item.link || "",
        resumo: item.resumo || "",
        sessionId: item.session_id,
        candidateIndex: item.candidate_index,
      }));

      setFavorites(loadedFavorites);
      // Sincronizar com localStorage
      localStorage.setItem("chatFavorites", JSON.stringify(loadedFavorites));
    } catch (error) {
      console.error("Erro ao carregar favoritos do Supabase:", error);
      loadFavoritesFromLocalStorage();
    }
  };

  // Carregar favoritos do localStorage
  const loadFavoritesFromLocalStorage = () => {
    const stored = localStorage.getItem("chatFavorites");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (error) {
        console.error("Erro ao carregar favoritos do localStorage:", error);
      }
    }
  };

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem("chatFavorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = async (candidate: FavoriteCandidate) => {
    setLoading(true);
    try {
      // Verificar se já existe localmente
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

      // Adicionar localmente primeiro para resposta imediata
      setFavorites([...favorites, candidate]);

      // Se estiver autenticado, salvar no Supabase
      if (userId) {
        const { error } = await supabase.from("chat_favorites").insert({
          user_id: userId,
          candidate_id: candidate.id,
          nome: candidate.nome,
          email: candidate.email,
          telefone: candidate.telefone,
          link: candidate.link,
          resumo: candidate.resumo,
          session_id: candidate.sessionId,
          candidate_index: candidate.candidateIndex,
        });

        if (error) {
          // Se houver erro, reverter mudança local
          setFavorites(favorites);
          
          if (error.code === '23505') {
            toast.info("Candidato já está nos favoritos");
          } else {
            throw error;
          }
        } else {
          toast.success("Candidato adicionado aos favoritos!");
        }
      } else {
        toast.success("Candidato adicionado aos favoritos locais!");
      }
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      toast.error("Erro ao adicionar favorito");
      // Reverter mudança local em caso de erro
      setFavorites(favorites);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (sessionId: string, candidateIndex: number) => {
    setLoading(true);
    try {
      const candidateToRemove = favorites.find(
        (f) => f.sessionId === sessionId && f.candidateIndex === candidateIndex
      );

      // Remover localmente primeiro
      const newFavorites = favorites.filter(
        (f) =>
          !(f.sessionId === sessionId && f.candidateIndex === candidateIndex)
      );
      setFavorites(newFavorites);

      // Se estiver autenticado, remover do Supabase
      if (userId && candidateToRemove) {
        const { error } = await supabase
          .from("chat_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("session_id", sessionId)
          .eq("candidate_index", candidateIndex);

        if (error) {
          // Reverter se houver erro
          setFavorites(favorites);
          throw error;
        }
      }

      toast.success("Candidato removido dos favoritos");
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      toast.error("Erro ao remover favorito");
      // Reverter mudança local
      setFavorites(favorites);
    } finally {
      setLoading(false);
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
    isAuthenticated: !!userId,
  };
};
