import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthFormData {
  email: string;
  password: string;
  primeiroNome?: string;
  sobrenome?: string;
}

const Login = () => {
  const [formData, setFormData] = useState<AuthFormData>({ 
    email: "", 
    password: "",
    primeiroNome: "",
    sobrenome: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup' | 'reset' | 'update-password'>('login');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Detecta se o usuário está retornando do email de recuperação
  useEffect(() => {
    const url = new URL(window.location.href);
    const type = url.searchParams.get("type");

    if (type === "recovery") {
      console.log("Modo recuperação detectado");
      setMode("update-password");
    }

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY") {
          console.log("Evento PASSWORD_RECOVERY detectado");
          setMode("update-password");
        }
        
        // Se o usuário fizer login com sucesso, redireciona
        if (event === "SIGNED_IN" && session && mode === "login") {
          navigate('/');
        }
      });

    return () => subscription.unsubscribe();
  }, [navigate, mode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === 'update-password') {
        if (newPassword !== confirmPassword) {
          toast({
            title: "Senhas não conferem",
            description: "Por favor, verifique se as senhas são iguais.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        if (newPassword.length < 6) {
          toast({
            title: "Senha muito curta",
            description: "A senha deve ter pelo menos 6 caracteres.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (error) {
          console.error('Erro ao atualizar senha:', error);
          toast({
            title: "Erro ao atualizar senha",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Senha atualizada!",
          description: "Sua senha foi alterada com sucesso. Faça login com a nova senha.",
        });
        
        // Limpa a query string da URL e volta para o modo login
        window.history.replaceState({}, document.title, "/login");
        setMode('login');
        setNewPassword("");
        setConfirmPassword("");
        setIsLoading(false);
        return;
      }

      if (mode === 'reset') {
        const redirectUrl = `${window.location.origin}/login?type=recovery`;
        const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
          redirectTo: redirectUrl
        });

        if (error) {
          console.error('Erro na recuperação:', error);
          toast({
            title: "Erro na recuperação",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha.",
        });
        setMode('login');
        setIsLoading(false);
        return;
      }

      if (mode === 'signup') {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              primeiro_nome: formData.primeiroNome,
              sobrenome: formData.sobrenome,
              nome: `${formData.primeiroNome} ${formData.sobrenome}`
            }
          }
        });

        if (error) {
          console.error('Erro no cadastro:', error);
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Cadastro realizado",
          description: "Verifique seu email para confirmar a conta",
        });
        setMode('login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Erro no login:', error);
          toast({
            title: "Erro de autenticação",
            description: error.message,
            variant: "destructive",
          });
          return;
        }

        if (data.user) {
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo ao sistema",
          });
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
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
              {mode === 'signup' 
                ? 'Criar Conta' 
                : mode === 'reset' 
                ? 'Recuperar Senha' 
                : mode === 'update-password'
                ? 'Nova Senha'
                : 'Bem-vindo'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signup' 
                ? 'Preencha os dados para criar sua conta' 
                : mode === 'reset'
                ? 'Digite seu email para recuperar a senha'
                : mode === 'update-password'
                ? 'Digite sua nova senha'
                : 'Entre com suas credenciais para continuar'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {mode === 'update-password' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite sua nova senha"
                      required
                      className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirmar Nova Senha
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    required
                    className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </>
            ) : (
              <>
                {mode === 'signup' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="primeiroNome" className="text-sm font-medium text-foreground">
                        Primeiro Nome
                      </Label>
                      <Input
                        id="primeiroNome"
                        type="text"
                        value={formData.primeiroNome}
                        onChange={(e) => setFormData(prev => ({ ...prev, primeiroNome: e.target.value }))}
                        placeholder="João"
                        required
                        className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sobrenome" className="text-sm font-medium text-foreground">
                        Sobrenome
                      </Label>
                      <Input
                        id="sobrenome"
                        type="text"
                        value={formData.sobrenome}
                        onChange={(e) => setFormData(prev => ({ ...prev, sobrenome: e.target.value }))}
                        placeholder="Silva"
                        required
                        className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Digite seu email"
                    required
                    className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {mode !== 'reset' && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-foreground">
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Digite sua senha"
                        required
                        className="h-11 rounded-lg border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg font-medium transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading 
                ? "Processando..." 
                : mode === 'signup' 
                ? 'Criar Conta' 
                : mode === 'reset' 
                ? 'Enviar Email' 
                : mode === 'update-password'
                ? 'Atualizar Senha'
                : 'Entrar'}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {mode === 'login' && (
              <button
                onClick={() => setMode('reset')}
                className="text-sm text-primary hover:underline block w-full"
              >
                Esqueceu sua senha?
              </button>
            )}
            
            {mode !== 'update-password' && (
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-primary hover:underline block w-full"
              >
                {mode === 'login' 
                  ? "Não tem uma conta? Cadastre-se" 
                  : "Já tem uma conta? Fazer login"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
