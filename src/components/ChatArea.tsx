import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import { AICandidateCard } from "./AICandidateCard";
import { useFavorites } from "@/hooks/useFavorites";

interface Message {
  id: string;
  content: string;
  type: 'human' | 'ai';
  timestamp: string;
}

interface ChatAreaProps {
  sessionId?: string;
  onSessionCreate?: (sessionId: string) => void;
}

export const ChatArea = ({ sessionId: propSessionId, onSessionCreate }: ChatAreaProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addFavorite, removeFavorite, isFavorited } = useFavorites();

  // Função para criar uma nova sessão
  const createNewSession = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSessionId(newSessionId);
    setMessages([]); // Limpar mensagens da nova sessão
    if (onSessionCreate) {
      onSessionCreate(newSessionId);
    }
    return newSessionId;
  };

  useEffect(() => {
    if (propSessionId === undefined) {
      // Quando propSessionId for undefined, significa que é uma nova consulta
      createNewSession();
    } else if (propSessionId && propSessionId !== currentSessionId) {
      // Mudança para uma sessão existente
      setCurrentSessionId(propSessionId);
      setMessages([]);
      loadChatHistory(propSessionId);
    }
  }, [propSessionId]);

  const loadChatHistory = async (sessionId?: string) => {
    const targetSessionId = sessionId || currentSessionId;
    if (!targetSessionId) return;
    
    try {
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', targetSessionId)
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const loadedMessages = data.map((record: any) => ({
          id: record.id.toString(),
          content: record.message.content,
          type: record.message.type,
          timestamp: new Date(record.message.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        }));
        
        // Só atualizar se for diferente do estado atual (evita duplicatas)
        setMessages(prev => {
          const prevJson = JSON.stringify(prev.map(m => m.id));
          const newJson = JSON.stringify(loadedMessages.map(m => m.id));
          return prevJson === newJson ? prev : loadedMessages;
        });
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const saveMessage = async (message: Message) => {
    if (!currentSessionId) return;
    
    try {
      await supabase
        .from('n8n_chat_histories')
        .insert({
          session_id: currentSessionId,
          message: {
            content: message.content,
            type: message.type,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentSessionId) return;
    
    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      type: "human",
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, message]);
    await saveMessage(message);
    setNewMessage("");
    setIsLoading(true);

    // Chamar webhook N8N
    try {
      console.log('Enviando para webhook:', { message: newMessage, sessionId: currentSessionId });
      
      const response = await fetch('https://engeform.up.railway.app/webhook/f6828a64-e683-4e53-a1b3-f4b149caf760', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          sessionId: currentSessionId
        })
      });

      console.log('Status da resposta:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Resposta do webhook:', data);
      
      // Tratar apenas o formato específico do N8N: {"text": "..."}
      let iaContent = '';
      if (data && typeof data === 'object' && data.text) {
        iaContent = data.text;
      } else {
        console.warn('Formato de resposta não esperado:', data);
        iaContent = "Erro: Formato de resposta inválido do sistema de IA";
      }
      
      const iaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: iaContent || "Resposta recebida do sistema de IA",
        type: "ai",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, iaMessage]);
      await saveMessage(iaMessage);
    } catch (error) {
      console.error('Erro ao chamar webhook:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Erro ao conectar com o sistema de IA: ${error.message}`,
        type: "ai",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para detectar múltiplos candidatos na mensagem
  const parseMultipleCandidates = (content: string): string[] => {
    // Detectar se há múltiplos candidatos separados por linhas vazias ou marcadores
    const candidatePattern = /(?:^|\n)(?:\*\*Nome:\*\*|\*\*Candidato)/gm;
    const matches = content.match(candidatePattern);
    
    if (!matches || matches.length <= 1) {
      return []; // Mensagem única, não tem múltiplos candidatos
    }

    // Dividir o conteúdo em blocos de candidatos
    const parts = content.split(/(?=\n\*\*(?:Nome|Candidato))/);
    return parts.filter(part => part.trim().length > 0);
  };

  // Função para extrair informações do candidato
  const extractCandidateInfo = (content: string) => {
    const nomeMatch = content.match(/\*\*Nome:\*\*\s*(.+)/);
    const emailMatch = content.match(/\*\*Email:\*\*\s*(.+)/);
    const telefoneMatch = content.match(/\*\*Telefone:\*\*\s*(.+)/);
    const linkMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
    const resumoMatch = content.match(/\*\*Resumo:\*\*\s*(.+)/);

    return {
      nome: nomeMatch?.[1]?.trim() || "Candidato",
      email: emailMatch?.[1]?.trim() || "",
      telefone: telefoneMatch?.[1]?.trim() || "",
      link: linkMatch?.[2] || "",
      resumo: resumoMatch?.[1]?.trim() || "",
    };
  };

  // Função de favoritar candidato
  const handleFavoriteCandidate = (messageId: string, candidateIndex: number, isFav: boolean) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !currentSessionId) return;

    const candidates = parseMultipleCandidates(message.content);
    const candidateContent = candidates[candidateIndex] || message.content;
    const candidateInfo = extractCandidateInfo(candidateContent);

    if (isFav) {
      addFavorite({
        id: `${messageId}_${candidateIndex}`,
        ...candidateInfo,
        sessionId: currentSessionId,
        candidateIndex,
      });
    } else {
      removeFavorite(currentSessionId, candidateIndex);
    }
  };

  return (
    <div className="flex-1 h-full bg-card border border-border rounded-2xl flex flex-col overflow-hidden"
         style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="p-6 border-b border-border bg-card">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Chat de Busca de Candidatos
        </h2>
        <p className="text-sm text-muted-foreground">
          Descreva o perfil que você está procurando
        </p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.type === 'human' ? 'flex-row-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'human' 
                  ? 'bg-primary' 
                  : 'bg-muted'
              }`}>
                {message.type === 'human' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[75%] ${
                message.type === 'human' ? 'flex justify-end' : ''
              }`}>
                {message.type === 'ai' && parseMultipleCandidates(message.content).length > 1 ? (
                  // Renderizar múltiplos candidatos como cards
                  <div className="space-y-4 w-full">
                    {parseMultipleCandidates(message.content).map((candidateContent, index) => (
                      <AICandidateCard
                        key={`${message.id}_${index}`}
                        content={candidateContent}
                        candidateIndex={index}
                        onFavorite={(idx, isFav) => handleFavoriteCandidate(message.id, idx, isFav)}
                        isFavorited={currentSessionId ? isFavorited(currentSessionId, index) : false}
                      />
                    ))}
                    <p className="text-xs text-muted-foreground mt-4">
                      {message.timestamp}
                    </p>
                  </div>
                ) : (
                  // Renderizar mensagem única
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.type === 'human'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`} style={{ 
                    boxShadow: message.type === 'human' 
                      ? 'var(--shadow-minimal)' 
                      : 'var(--shadow-minimal)' 
                  }}>
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert [&_a]:underline [&_a]:text-primary [&_a:hover]:text-primary/80">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <p className={`text-xs mt-2 ${
                      message.type === 'human'
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}>
                      {message.timestamp}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-muted">
                <Bot className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 max-w-[75%]">
                <div className="px-4 py-3 rounded-2xl bg-muted text-foreground" style={{ boxShadow: 'var(--shadow-minimal)' }}>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-sm">Gerando resposta</span>
                    <div className="flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-6 border-t border-border bg-card">
        <div className="flex gap-3">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Descreva o perfil de candidato..."
            className="flex-1 bg-input border-border rounded-2xl px-4 py-3 focus:ring-1 focus:ring-primary"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-primary hover:bg-primary/90 rounded-2xl px-6 transition-all duration-200"
            style={{ boxShadow: 'var(--shadow-minimal)' }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};