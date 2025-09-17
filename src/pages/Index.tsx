import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { CandidateResults } from "@/components/CandidateResults";
import { useState, useRef } from "react";

const Index = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(undefined);
  
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
          <button
            onClick={() => {
              localStorage.removeItem('isAuthenticated');
              localStorage.removeItem('userLogin');
              window.location.href = '/login';
            }}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
          >
            Sair
          </button>
        </div>
      </header>
      
      <main className="flex h-[calc(100vh-85px)] p-6 gap-6">
        <ChatSidebar 
          onSelectChat={(sessionId) => {
            setSelectedSessionId(sessionId); // undefined para nova sessão, string para sessão existente
          }}
          currentSessionId={selectedSessionId}
        />
        <ChatArea 
          sessionId={selectedSessionId}
          onSessionCreate={(sessionId) => {
            setSelectedSessionId(sessionId); // Atualiza quando uma nova sessão é criada
          }}
        />
        <CandidateResults />
      </main>
    </div>
  );
};

export default Index;
