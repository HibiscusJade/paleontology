import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-paper-bright flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-8xl font-bold text-strata-blue-deep/20">404</p>
        <h1 className="text-2xl font-bold text-strata-blue-deep">页面未找到</h1>
        <p className="text-muted-foreground max-w-md">
          您访问的页面不存在或已被移除。请检查网址是否正确，或返回首页。
        </p>
        <Button
          onClick={() => setLocation("/admin/dashboard")}
          className="bg-strata-blue-deep hover:bg-strata-blue-deep/90 text-white"
        >
          <Home className="h-4 w-4 mr-2" />
          返回首页
        </Button>
      </div>
    </div>
  );
}
