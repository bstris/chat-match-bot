import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  type: 'human' | 'ia';
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
        setMessages(loadedMessages);
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
        type: "ia",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, iaMessage]);
      await saveMessage(iaMessage);
    } catch (error) {
      console.error('Erro ao chamar webhook:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Erro ao conectar com o sistema de IA: ${error.message}`,
        type: "ia",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, errorMessage]);
      await saveMessage(errorMessage);
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
                <div className={`px-4 py-3 rounded-2xl ${
                  message.type === 'human'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`} style={{ 
                  boxShadow: message.type === 'human' 
                    ? 'var(--shadow-minimal)' 
                    : 'var(--shadow-minimal)' 
                }}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'human'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
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