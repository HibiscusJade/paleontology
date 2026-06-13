import { useAdmin, type ReviewItem, type DashboardStats } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, ClipboardCheck, Calendar, CreditCard, Clock, AlertCircle, FileText } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { MEMBERSHIP_STATUS_LABEL } from "@shared/constants";

const CHART_COLORS = ["#002B49", "#C41E3A", "#D9C5A0", "#715a3e", "#406182", "#8B0000"];

function StatCard({
  title,
  value,
  icon: Icon,
  delay,
}: {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-strata-blue-deep">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  const label = MEMBERSHIP_STATUS_LABEL[status] || status;
  const colorMap: Record<string, string> = {
    voucher_submitted: "bg-yellow-50 text-yellow-700 border-yellow-200",
    voucher_rejected: "bg-red-50 text-red-700 border-red-200",
    invoice_pending: "bg-blue-50 text-blue-700 border-blue-200",
    invoice_submitted: "bg-yellow-50 text-yellow-700 border-yellow-200",
    invoice_rejected: "bg-red-50 text-red-700 border-red-200",
    invoice_overdue: "bg-orange-50 text-orange-700 border-orange-200",
    active: "bg-green-50 text-green-700 border-green-200",
    confirmed: "bg-green-50 text-green-700 border-green-200",
    not_member: "bg-gray-50 text-gray-500 border-gray-200",
    expired: "bg-gray-50 text-gray-500 border-gray-200",
  };
  return (
    <Badge variant="outline" className={colorMap[status] || "bg-gray-50 text-gray-500 border-gray-200"}>
      {label}
    </Badge>
  );
}

function SuperAdminView({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="会员总数" value={stats.totalMembers} icon={Users} delay={0} />
        <StatCard title="活跃会员" value={stats.activeMembers} icon={LayoutDashboard} delay={0.1} />
        <StatCard title="待审核" value={stats.pendingReviews} icon={ClipboardCheck} delay={0.2} />
        <StatCard title="进行中会议" value={stats.activeConferences} icon={Calendar} delay={0.3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">分会会员分布</CardTitle>
            <CardDescription>各分会绑定会员数量统计</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.branchMemberCounts && stats.branchMemberCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.branchMemberCounts} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DA" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" name="会员数" fill="#002B49" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近审核记录</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentReviews && stats.recentReviews.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>提交时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentReviews.slice(0, 5).map((r: ReviewItem) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.userName || r.userEmail}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {r.type === "society_fee" ? "会员费" : "会议费"}
                        </Badge>
                      </TableCell>
                      <TableCell>¥{r.amount}</TableCell>
                      <TableCell><ReviewStatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.submitTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function BranchAdminView() {
  const { getBranchDashboardStats, adminBranchId } = useAdmin();
  if (!adminBranchId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          无法加载分会数据：未指定分会
        </CardContent>
      </Card>
    );
  }
  const stats = getBranchDashboardStats(adminBranchId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="分会会议" value={stats.branchConferences} icon={Calendar} delay={0} />
        <StatCard title="报名人数" value={stats.branchRegistrations} icon={Users} delay={0.1} />
        <StatCard title="分会会员" value={stats.branchMemberCount} icon={LayoutDashboard} delay={0.2} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">待审核</CardTitle>
            <CardDescription>当前待处理的审核数量</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-bold text-strata-blue-deep">{stats.branchPendingReviews}</span>
              <span className="text-muted-foreground">条审核待处理</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {stats.recentRegistrations && stats.recentRegistrations.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">最近报名</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>会议</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentRegistrations.map((reg, i) => (
                    <TableRow key={i}>
                      <TableCell>{reg.userName}</TableCell>
                      <TableCell>{reg.conferenceName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{reg.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32 text-muted-foreground">暂无数据</CardContent>
        </Card>
      )}
    </div>
  );
}

function FinanceReviewerView() {
  const { getFinanceDashboardStats } = useAdmin();
  const stats = getFinanceDashboardStats();

  const pieData = [
    { name: "待初审", value: stats.pendingVoucher },
    { name: "待终审", value: stats.pendingInvoice },
    { name: "已处理(今日)", value: stats.processedToday },
    { name: "逾期", value: stats.overdueCount },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="待初审" value={stats.pendingVoucher} icon={ClipboardCheck} delay={0} />
        <StatCard title="待终审" value={stats.pendingInvoice} icon={FileText} delay={0.1} />
        <StatCard title="今日已处理" value={stats.processedToday} icon={CreditCard} delay={0.2} />
        <StatCard title="逾期未上传" value={stats.overdueCount} icon={Clock} delay={0.3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">审核分布</CardTitle>
            <CardDescription>当前审核任务分布概览</CardDescription>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" labelLine={true} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近审核记录</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentReviews && stats.recentReviews.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用户</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>提交时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentReviews.slice(0, 10).map((r: ReviewItem) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.userName || r.userEmail}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {r.type === "society_fee" ? "会员费" : "会议费"}
                        </Badge>
                      </TableCell>
                      <TableCell>¥{r.amount}</TableCell>
                      <TableCell><ReviewStatusBadge status={r.status} /></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.submitTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">暂无数据</div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="py-12">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function Dashboard() {
  const { adminRole, getDashboardStats } = useAdmin();

  if (!adminRole) {
    return <DashboardLoading />;
  }

  if (adminRole === "super_admin") {
    const stats = getDashboardStats();
    return <SuperAdminView stats={stats} />;
  }

  if (adminRole === "branch_admin") {
    return <BranchAdminView />;
  }

  if (adminRole === "finance_reviewer") {
    return <FinanceReviewerView />;
  }

  return <DashboardLoading />;
}
