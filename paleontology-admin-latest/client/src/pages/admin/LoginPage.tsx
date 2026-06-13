import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { adminLogin, isAdminLoggedIn } = useAdmin();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isAdminLoggedIn) {
      setLocation("/admin/dashboard");
    }
  }, [isAdminLoggedIn, setLocation]);

  const onSubmit = (data: LoginFormData) => {
    setLoading(true);
    const success = adminLogin(data.email, data.password);
    setLoading(false);
    if (success) {
      setLocation("/admin/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-strata-blue-deep flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-2xl border-accent-gold/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 h-3 w-12 bg-accent-gold rounded-full" />
          <CardTitle className="text-strata-blue-deep text-xl font-bold tracking-wide">
            中国古生物学会
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            管理后台
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">管理员邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@paleontology.org.cn"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-party-red" : ""}
              />
              {errors.email && (
                <p className="text-party-red text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="请输入密码"
                autoComplete="current-password"
                {...register("password")}
                className={errors.password ? "border-party-red" : ""}
              />
              {errors.password && (
                <p className="text-party-red text-xs">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-strata-blue-deep hover:bg-strata-blue-deep/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
