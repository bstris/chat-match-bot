import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: string;
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Olá! Estou procurando um desenvolvedor frontend com experiência em React e TypeScript para um projeto de e-commerce.",
    type: "user",
    timestamp: "14:30"
  },
  {
    id: "2",
    content: "Encontrei alguns candidatos que se encaixam no seu perfil. Baseado nos seus requisitos, identifiquei 3 candidatos com alta compatibilidade. Você pode ver os detalhes na seção ao lado.",
    type: "bot",
    timestamp: "14:31"
  }
];

export const ChatArea = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      type: "user",
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  return (
    <Card className="flex-1 h-full bg-card border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Chat de Busca de Candidatos
        </h2>
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
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`p-2 rounded-full ${
                message.type === 'user' 
                  ? 'bg-gradient-primary' 
                  : 'bg-secondary'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Bot className="w-4 h-4 text-foreground" />
                )}
              </div>
              
              <div className={`flex-1 max-w-[70%] ${
                message.type === 'user' ? 'text-right' : ''
              }`}>
                <Card className={`p-3 ${
                  message.type === 'user'
                    ? 'bg-gradient-primary text-primary-foreground ml-auto'
                    : 'bg-gradient-card'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.type === 'user'
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