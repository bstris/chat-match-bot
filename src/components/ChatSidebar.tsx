import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatHistory {
  session_id: string;
  title: string;
  timestamp: string;
  preview: string;
}

interface ChatSidebarProps {
  onSelectChat?: (sessionId: string) => void;
  currentSessionId?: string;
}

export const ChatSidebar = ({ onSelectChat, currentSessionId }: ChatSidebarProps) => {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('n8n_chat_histories')
        .select('session_id, message')
        .order('id', { ascending: false });

      if (error) throw error;

      if (data) {
        // Agrupar por session_id e pegar a primeira mensagem de cada sessão
        const sessions = new Map();
        data.forEach((record: any) => {
          if (!sessions.has(record.session_id)) {
            const content = record.message?.content || '';
            sessions.set(record.session_id, {
              session_id: record.session_id,
              title: content.length > 30 ? content.substring(0, 30) + '...' : content,
              timestamp: new Date(record.message?.timestamp || Date.now()).toLocaleString('pt-BR'),
              preview: content.length > 50 ? content.substring(0, 50) + '...' : content
            });
          }
        });

        setChatHistory(Array.from(sessions.values()).slice(0, 10));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };
  return (
    <Card className="w-80 h-full bg-card border-border">
      <div className="p-4 border-b border-border">
        <Button className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Nova Consulta
        </Button>
      </div>
      
      <div className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Histórico
        </h3>
        
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2">
            {chatHistory.map((chat) => (
              <Card 
                key={chat.session_id}
                className={`p-3 cursor-pointer hover:bg-secondary/50 transition-colors border-border bg-gradient-card ${
                  currentSessionId === chat.session_id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => onSelectChat?.(chat.session_id)}
              >
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {chat.preview}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {chat.timestamp}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </Card>
  );
};