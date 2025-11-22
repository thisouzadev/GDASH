import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

// Schema de validação Zod
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.access_token) {
        toast.error(result.message || "Login falhou. Verifique suas credenciais.");
        return;
      }

      localStorage.setItem("token", result.access_token);
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro desconhecido ao tentar conectar.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card
        className="
      w-[372px]       /* largura fixa de 372px */
      rounded-xl 
      shadow-2xl 
      border border-gray-100 
      bg-white/95 
      backdrop-blur-sm 
      z-10 
      p-6
      transition-all duration-300 
      hover:shadow-indigo-300/50
      mx-auto          
    "
      >
        <CardHeader className="text-center pt-6 sm:pt-8 pb-4">
          <CardTitle className="text-3xl font-extrabold text-indigo-700">Acesso</CardTitle>
          <CardDescription className="text-gray-500 mt-1">Entre na sua conta para continuar</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit(
              onSubmit,
              (formErrors) => {
                const messages = Object.values(formErrors)
                  .map(err => err?.message)
                  .filter(Boolean)
                  .join(", ");
                if (messages) toast.error(messages);
              }
            )}
            className="flex flex-col gap-4 sm:gap-6"
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="exemplo@dominio.com"
                className="w-full max-w-full h-10 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                {...register("email")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="******"
                className="w-full max-w-full h-10 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                {...register("password")}
              />
            </div>
            <Button
              type="submit"
              className="w-full max-w-full h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <div className="flex justify-center pb-6">
          <p className="text-sm text-gray-600">
            Não tem conta?{" "}
            <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors">
              Cadastre-se
            </a>
          </p>
        </div>
      </Card>
    </div>

  );
}
