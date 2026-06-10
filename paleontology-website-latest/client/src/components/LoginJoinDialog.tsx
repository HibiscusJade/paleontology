import React, { useState, useEffect } from "react";
import { useMembership } from "../contexts/MembershipContext";
import { toast } from "sonner";

interface LoginJoinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTab?: "login" | "register" | "forgot";
}

export default function LoginJoinDialog({ open, onOpenChange, initialTab = "login" }: LoginJoinDialogProps) {
  const { login, register, resetPassword, isLoggedIn, currentUser } = useMembership();
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">(initialTab);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setPasswordConfirm] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"男" | "女">("男");
  const [unit, setUnit] = useState("");
  const [role, setRole] = useState<"学生" | "教师" | "嘉宾" | "">("")
  const [title, setTitle] = useState("");

  // Sync tab with initialTab prop when dialog opens
  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  if (!open) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("请填写邮箱和密码！");
      return;
    }
    const success = login(email, password);
    if (success) {
      onOpenChange(false);
      // Reset fields
      setEmail("");
      setPassword("");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !name || !unit) {
      toast.error("请填写所有必填字段（带有 * 标记）！");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("两次输入的密码不一致！");
      return;
    }

    if (password.length < 6) {
      toast.error("密码长度至少为 6 位！");
      return;
    }

    const success = register({
      email,
      name,
      gender,
      unit,
      role: (role || "教师") as "学生" | "教师" | "嘉宾",
      title: title || undefined
    }, password);

    if (success) {
      setActiveTab("login");
      setPassword("");
      setPasswordConfirm("");
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("请填写注册邮箱！");
      return;
    }
    resetPassword(email);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-white border border-[#E5E1DA] rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300">
        
        {/* Header background with Stratigraphic Fossil Theme */}
        <div className="bg-[#002B49] text-white px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-2xl text-[#f5e0ba]">account_balance</span>
              <h2 className="text-xl font-bold font-serif tracking-wide" style={{ fontFamily: "Georgia, serif" }}>
                {activeTab === "login" && "账号登录 · SIGN IN"}
                {activeTab === "register" && "注册账号 · REGISTER"}
                {activeTab === "forgot" && "重置密码 · RESET PASSWORD"}
              </h2>
            </div>
            <button 
              onClick={() => onOpenChange(false)}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* TAB SWITCHER */}
          {activeTab !== "forgot" && (
            <div className="flex border-b border-[#E5E1DA] mb-6">
              <button
                onClick={() => setActiveTab("login")}
                className={`flex-1 pb-3 text-sm font-bold transition-all border-b-2 ${
                  activeTab === "login" 
                    ? "border-[#002B49] text-[#002B49]" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                账号登录
              </button>
              <button
                onClick={() => setActiveTab("register")}
                className={`flex-1 pb-3 text-sm font-bold transition-all border-b-2 ${
                  activeTab === "register" 
                    ? "border-[#002B49] text-[#002B49]" 
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                注册账号
              </button>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">电子邮箱 *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@paleontology.org.cn"
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-500 tracking-wider">登录密码 *</label>
                  <button 
                    type="button" 
                    onClick={() => setActiveTab("forgot")}
                    className="text-xs text-[#715a3e] hover:underline font-bold"
                  >
                    忘记密码？
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">lock</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入您的密码"
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              {/* Demo Account Hint */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-blue-700 font-bold mb-1">📝 演示账号（用于快速测试）：</p>
                <p className="text-xs text-blue-600">邮箱：<code className="bg-white px-1 py-0.5 rounded">demo@paleontology.org.cn</code></p>
                <p className="text-xs text-blue-600">密码：<code className="bg-white px-1 py-0.5 rounded">demo123</code></p>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-[#002B49] hover:bg-[#001f35] text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">login</span> 立即登录
                </button>
              </div>

              <div className="text-center text-xs text-slate-400 pt-2">
                还没有账号？{" "}
                <button 
                  type="button" 
                  onClick={() => setActiveTab("register")} 
                  className="text-[#002B49] font-bold hover:underline"
                >
                  立即注册
                </button>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">真实姓名 *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入您的姓名"
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">性别 *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "男" | "女")}
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                  >
                    <option value="男">男 (Male)</option>
                    <option value="女">女 (Female)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">电子邮箱 * (唯一且注册后不可修改)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入常用工作或学术邮箱"
                  className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">登录密码 *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="至少 6 位密码"
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">确认密码 *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="请再次输入密码"
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">工作/学习单位 *</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="如：南京大学、中科院等"
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2 tracking-wider">职务类型 (可选)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "学生", label: "学生" },
                      { value: "教师", label: "老师" },
                      { value: "嘉宾", label: "其他" }
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value as "学生" | "教师" | "嘉宾")}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all border ${
                          role === opt.value
                            ? "bg-[#002B49] text-white border-[#002B49]"
                            : "bg-white text-slate-700 border-[#E5E1DA] hover:border-[#002B49] hover:text-[#002B49]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">职称 (可选)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="如：研究员、副教授、博士后、硕士生"
                  className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#002B49] hover:bg-[#001f35] text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span> 提交注册
                </button>
              </div>

              <div className="text-center text-xs text-slate-400 pt-1">
                已有账号？{" "}
                <button 
                  type="button" 
                  onClick={() => setActiveTab("login")} 
                  className="text-[#002B49] font-bold hover:underline"
                >
                  立即登录
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {activeTab === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="bg-[#FCFAF7] border border-[#E5E1DA] p-4 rounded-lg text-xs text-slate-600 leading-relaxed mb-4">
                请输入您的注册邮箱，系统将自动向该邮箱发送一封包含密码重置链接的邮件。收到后请点击链接重新设定您的登录密码。
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wider">注册电子邮箱 *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@paleontology.org.cn"
                    className="w-full bg-slate-50 border border-[#E5E1DA] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#002B49] focus:bg-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className="flex-1 border border-[#E5E1DA] text-slate-600 hover:bg-slate-50 py-2.5 rounded-lg font-bold text-sm transition-colors"
                >
                  返回登录
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#002B49] hover:bg-[#001f35] text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md"
                >
                  发送重置邮件
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
