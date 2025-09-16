import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatArea } from "@/components/ChatArea";
import { CandidateResults } from "@/components/CandidateResults";
import { useState } from "react";

const Index = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string>();
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-semibold text-foreground">
            Sistema de Seleção de Candidatos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Conectado via webhook N8N • Chat inteligente para matching de candidatos
          </p>
        </div>
      </header>
      
      <main className="flex h-[calc(100vh-85px)] p-6 gap-6">
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
