import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { CandidateResults } from "@/components/CandidateResults";
import { FavoriteVagaSelector } from "@/components/FavoriteVagaSelector";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const navigate = useNavigate();
  const { showVagaDialog, setShowVagaDialog, saveToSupabase } = useFavorites();

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles' as any)
          .select('primeiro_nome')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserName((data as any).primeiro_nome);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar nome do usuário:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Sistema de Seleção de Candidatos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Conectado via webhook N8N • Chat inteligente para matching de candidatos
            </p>
          </div>
          <div className="flex items-center gap-4">
            {userName && (
              <span className="text-sm text-foreground">
                Olá, <span className="font-medium">{userName}</span>
              </span>
            )}
            <Button
              variant="outline"
              onClick={() => navigate('/favorites')}
              className="gap-2"
            >
              <Heart className="w-4 h-4" />
              Meus Favoritos
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/mec-data')}
              className="gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Dados MEC
            </Button>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
              }}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex h-[calc(100vh-85px)] p-6 gap-6">
        <ChatSidebar 
          onSelectChat={(sessionId) => {
            setSelectedSessionId(sessionId);
            setShowResults(!!sessionId);
            // Limpar candidatos ao trocar de sessão
            if (!sessionId) {
              setCandidates([]);
            }
          }}
          currentSessionId={selectedSessionId}
        />
        <div className={`${showResults ? 'flex-1' : 'flex-[2]'} transition-all duration-300`}>
          <ChatArea 
            sessionId={selectedSessionId}
            onSessionCreate={(sessionId) => {
              setSelectedSessionId(sessionId);
              setShowResults(true);
            }}
            onCandidatesUpdate={(newCandidates) => {
              setCandidates(newCandidates);
            }}
          />
        </div>
        {showResults && <CandidateResults candidates={candidates} />}
      </main>

      <FavoriteVagaSelector
        open={showVagaDialog}
        onOpenChange={setShowVagaDialog}
        onVagaSelected={saveToSupabase}
      />
    </div>
  );
};

export default Index;
