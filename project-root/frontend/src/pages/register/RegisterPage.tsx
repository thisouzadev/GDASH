import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import userServices from "@/services/user/userServices";

const loginSchema = z.object({
  name: z.string().min(2, "Nome precisa ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter ao menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await userServices.createUser(data);
      toast.success("Usuário criado com sucesso!");

      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      const result = await res.json();

      if (!res.ok || !result.access_token) {
        toast.error(result.message || "Login falhou após o registro.");
        return;
      }

      localStorage.setItem("token", result.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erro desconhecido ao tentar registrar.");
    }
  };

  const returnToLogin = () => {
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-[372px] rounded-xl shadow-2xl border border-gray-100 bg-white/95 backdrop-blur-sm z-10 p-6 transition-all duration-300 hover:shadow-indigo-300/50 mx-auto">
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
              <Label htmlFor="name" className="text-gray-700 font-medium">Nome</Label>
              <Input id="name" type="text" placeholder="nome completo" {...register("name")} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input id="email" type="email" placeholder="exemplo@dominio.com" {...register("email")} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password" className="text-gray-700 font-medium">Senha</Label>
              <Input id="password" type="password" placeholder="******" {...register("password")} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="w-[185px] h-12 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={isSubmitting}>
                {isSubmitting ? "Cadastrando..." : "Cadastrar"}
              </Button>
              <Button type="button" className="w-[185px] h-12 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-semibold" onClick={returnToLogin}>
                Voltar ao Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
