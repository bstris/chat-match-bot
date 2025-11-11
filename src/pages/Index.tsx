import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { CandidateResults } from "@/components/CandidateResults";
import { FavoriteVagaSelector } from "@/components/FavoriteVagaSelector";
import { DashboardTab } from "@/components/DashboardTab";
import { useFavorites } from "@/hooks/useFavorites";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, GraduationCap, LayoutDashboard, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  const [showResults, setShowResults] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [sessionCandidates, setSessionCandidates] = useState<Map<string, any[]>>(new Map());
  const [favorites, setFavorites] = useState<any[]>([]);
  const navigate = useNavigate();
  const { showVagaDialog, setShowVagaDialog, saveToSupabase } = useFavorites();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('chat_favoritos' as any)
          .select('*')
          .eq('recrutador_id', user.id);
        
        if (data && !error) {
          setFavorites(data);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
    }
  };

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
            // Restaurar candidatos da sessão selecionada
            if (sessionId && sessionCandidates.has(sessionId)) {
              setCandidates(sessionCandidates.get(sessionId) || []);
            } else {
              setCandidates([]);
            }
          }}
          currentSessionId={selectedSessionId}
        />
        <div className={`${showResults ? 'flex-1' : 'flex-[2]'} transition-all duration-300`}>
          <Tabs defaultValue="chat" className="h-full">
            <TabsList className="w-full bg-card border-b border-border rounded-none h-12">
              <TabsTrigger value="chat" className="flex-1 gap-2">
                <MessageSquare className="w-4 h-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex-1 gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="h-[calc(100%-3rem)] mt-0">
              <ChatArea 
                sessionId={selectedSessionId}
                onSessionCreate={(sessionId) => {
                  setSelectedSessionId(sessionId);
                  setShowResults(true);
                }}
                onCandidatesUpdate={(newCandidates) => {
                  if (selectedSessionId) {
                    // Acumular candidatos por sessão
                    const existingCandidates = sessionCandidates.get(selectedSessionId) || [];
                    
                    // Criar um mapa para remover duplicatas por nome e email
                    const candidateMap = new Map();
                    
                    // Adicionar candidatos existentes
                    existingCandidates.forEach(c => {
                      const key = `${c.name}_${c.email}`;
                      candidateMap.set(key, c);
                    });
                    
                    // Adicionar novos candidatos (sobrescrever se já existir)
                    newCandidates.forEach(c => {
                      const key = `${c.name}_${c.email}`;
                      candidateMap.set(key, c);
                    });
                    
                    // Converter de volta para array e ordenar por compatibilidade
                    const mergedCandidates = Array.from(candidateMap.values())
                      .sort((a, b) => b.compatibility - a.compatibility);
                    
                    // Atualizar estado
                    setSessionCandidates(prev => new Map(prev).set(selectedSessionId, mergedCandidates));
                    setCandidates(mergedCandidates);
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="dashboard" className="h-[calc(100%-3rem)] mt-0">
              <DashboardTab candidates={candidates} favorites={favorites} />
            </TabsContent>
          </Tabs>
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
