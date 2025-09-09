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
  const [currentSessionId, setCurrentSessionId] = useState(() => 
    propSessionId || `session_${Date.now()}`
  );

  useEffect(() => {
    if (propSessionId && propSessionId !== currentSessionId) {
      setCurrentSessionId(propSessionId);
      setMessages([]);
    }
    loadChatHistory();
  }, [propSessionId, currentSessionId]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('*')
        .eq('session_id', currentSessionId)
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
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      type: "human",
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    
    // Se é uma nova sessão, notificar o componente pai
    if (currentSessionId.startsWith('session_') && onSessionCreate) {
      onSessionCreate(currentSessionId);
    }
    
    setMessages(prev => [...prev, message]);
    await saveMessage(message);
    setNewMessage("");

    // Simular resposta do bot por enquanto
    setTimeout(async () => {
      const iaMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Processando sua solicitação... Em breve conectarei com o webhook N8N para buscar candidatos compatíveis.",
        type: "ia",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, iaMessage]);
      await saveMessage(iaMessage);
    }, 1000);
  };

  return (
    <Card className="flex-1 h-full bg-card border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3 mb-2">
          <div className="px-4 py-2 bg-gray-600 text-white font-bold text-lg rounded">
            ENGEFORM
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Chat de Busca de Candidatos
          </h2>
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="px-4 py-1 bg-blue-800 text-white font-bold text-sm rounded">
            ENGENHARIA
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Descreva o perfil que você está procurando
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.type === 'human' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-full ${
                message.type === 'human' 
                  ? 'bg-gradient-primary' 
                  : 'bg-secondary'
              }`}>
                {message.type === 'human' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-foreground" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[70%] ${
                message.type === 'human' ? 'text-right' : ''
              }`}>
                <Card className={`p-3 ${
                  message.type === 'human'
                    ? 'bg-gradient-primary text-primary-foreground ml-auto'
                    : 'bg-gradient-card'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'human'
                      ? 'text-primary-foreground/70'
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp}
                  </p>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Descreva o perfil de candidato que você está procurando..."
            className="flex-1 bg-input border-border"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};