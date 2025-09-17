import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [loginData, setLoginData] = useState({ login: "", senha: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Tentando login com:', { login: loginData.login, senha: loginData.senha });
      
      const { data, error } = await supabase
        .from('login' as any)
        .select('*')
        .eq('login', loginData.login)
        .eq('senha', loginData.senha)
        .maybeSingle();

      console.log('Resultado da consulta:', { data, error });

      if (error) {
        console.error('Erro do Supabase:', error);
        toast({
          title: "Erro de conexão",
          description: "Erro ao conectar com o banco de dados",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        console.log('Nenhum dados encontrado para as credenciais fornecidas');
        toast({
          title: "Erro de autenticação",
          description: "Credenciais inválidas",
          variant: "destructive",
        });
        return;
      }

      // Salvar autenticação no localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userLogin', loginData.login);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao sistema",
      });
      
      navigate('/');
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Erro interno do sistema",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl shadow-soft p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Bem-vindo
            </h1>
            <p className="text-sm text-muted-foreground">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login" className="text-sm font-medium text-foreground">
                Login
              </Label>
              <Input
                id="login"
                type="text"
                value={loginData.login}
                onChange={(e) => setLoginData(prev => ({ ...prev, login: e.target.value }))}
                placeholder="Digite seu login"
                required
                className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium text-foreground">
                Senha
              </Label>
              <Input
                id="senha"
                type="password"
                value={loginData.senha}
                onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                placeholder="Digite sua senha"
                required
                className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Credenciais padrão: root / rootn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;