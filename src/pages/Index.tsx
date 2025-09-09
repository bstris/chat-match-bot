import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { CandidateResults } from "@/components/CandidateResults";
import { useState } from "react";

const Index = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-foreground">
            Sistema de Seleção de Candidatos
          </h1>
          <p className="text-sm text-muted-foreground">
            Conectado via webhook N8N • Chat inteligente para matching de candidatos
          </p>
        </div>
      </header>
      
      <main className="flex h-[calc(100vh-80px)] p-4 gap-4">
        <ChatSidebar 
          onSelectChat={setSelectedSessionId}
          currentSessionId={selectedSessionId}
        />
        <ChatArea 
          sessionId={selectedSessionId}
          onSessionCreate={setSelectedSessionId}
        />
        <CandidateResults />
      </main>
    </div>
  );
};

export default Index;
