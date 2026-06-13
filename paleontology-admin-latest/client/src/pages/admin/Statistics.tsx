import { useAdmin, type DashboardStats } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Users, CreditCard, Calendar, Building2 } from "lucide-react";
import { toast } from "sonner";
import { BRANCH_MAP } from "@shared/constants";

const CHART_COLORS = ["#002B49", "#C41E3A", "#D9C5A0", "#715a3e", "#406182", "#8B0000", "#2d6a4f", "#9b2226", "#ca6702", "#005f73", "#0b525b"];

function SuperAdminStatistics({ stats }: { stats: DashboardStats }) {
  const { getAllConferences } = useAdmin();
  const conferences = getAllConferences();

  const handleExport = () => {
    toast("导出功能将在第二期实现");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-strata-blue-deep">数据统计总览</h2>
          <p className="text-sm text-muted-foreground">会员、分会和会议的综合统计数据</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          导出Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">会员总数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-strata-blue-deep">{stats.totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">活跃会员</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-strata-blue-deep">{stats.activeMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">待审核</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-strata-blue-deep">{stats.pendingReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">进行中会议</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-strata-blue-deep">{stats.activeConferences}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">分会会员分布 (柱状图)</CardTitle>
            <CardDescription>各分会绑定的会员数量</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.branchMemberCounts && stats.branchMemberCounts.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.branchMemberCounts} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E1DA" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={80} tick={{ fontSize: 10 }} />
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

        <Card>
          <CardHeader>
            <CardTitle className="text-base">分会会员分布 (饼图)</CardTitle>
            <CardDescription>各分会会员占比</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.branchMemberCounts && stats.branchMemberCounts.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={stats.branchMemberCounts.filter((d) => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, count }) => `${name}: ${count}`}
                    outerRadius={100}
                    dataKey="count"
                  >
                    {stats.branchMemberCounts.filter((d) => d.count > 0).map((_, index) => (
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">会议费统计</CardTitle>
          <CardDescription>所有会议的费用和报名情况</CardDescription>
        </CardHeader>
        <CardContent>
          {conferences.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>会议名称</TableHead>
                  <TableHead>分会</TableHead>
                  <TableHead>会员价 (¥)</TableHead>
                  <TableHead>非会员价 (¥)</TableHead>
                  <TableHead>报名人数</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences.map((conf) => (
                  <TableRow key={conf.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={conf.name}>
                      {conf.name}
                    </TableCell>
                    <TableCell>{conf.branchName}</TableCell>
                    <TableCell>¥{conf.memberFee}</TableCell>
                    <TableCell>¥{conf.nonMemberFee}</TableCell>
                    <TableCell>{conf.registrations}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={conf.status === "published" ? "text-green-600 border-green-300 bg-green-50" : "text-gray-500 border-gray-300 bg-gray-50"}>
                        {conf.status === "published" ? "已发布" : "草稿"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">暂无数据</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BranchAdminStatistics() {
  const { adminBranchId, getBranchDashboardStats, getBranchConferences } = useAdmin();

  if (!adminBranchId) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          无法加载分会统计数据：未指定分会
        </CardContent>
      </Card>
    );
  }

  const stats = getBranchDashboardStats(adminBranchId);
  const conferences = getBranchConferences(adminBranchId);

  const handleExport = () => {
    toast("导出功能将在第二期实现");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-strata-blue-deep">{BRANCH_MAP[adminBranchId] || adminBranchId} - 数据统计</h2>
          <p className="text-sm text-muted-foreground">分会会议和会员统计</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          导出Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">分会会议数</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-strata-blue-deep">{stats.branchConferences}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">总报名人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-strata-blue-deep">{stats.branchRegistrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">分会会员数</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-strata-blue-deep">{stats.branchMemberCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">会议报名统计</CardTitle>
          <CardDescription>本分会各会议的报名情况</CardDescription>
        </CardHeader>
        <CardContent>
          {conferences.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>会议名称</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>地点</TableHead>
                  <TableHead>报名人数</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conferences.map((conf) => (
                  <TableRow key={conf.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={conf.name}>
                      {conf.name}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {conf.startDate} ~ {conf.endDate}
                    </TableCell>
                    <TableCell>{conf.location}</TableCell>
                    <TableCell>{conf.registrations}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={conf.status === "published" ? "text-green-600 border-green-300 bg-green-50" : "text-gray-500 border-gray-300 bg-gray-50"}>
                        {conf.status === "published" ? "已发布" : "草稿"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-32 text-muted-foreground">暂无数据</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Statistics() {
  const { adminRole, getDashboardStats } = useAdmin();

  if (adminRole === "super_admin") {
    const stats = getDashboardStats();
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-strata-blue-deep">数据统计</h1>
          <p className="text-muted-foreground mt-1">学会运营数据的可视化统计与分析</p>
        </div>
        <SuperAdminStatistics stats={stats} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-strata-blue-deep">数据统计</h1>
        <p className="text-muted-foreground mt-1">分会运营数据的可视化统计与分析</p>
      </div>
      <BranchAdminStatistics />
    </div>
  );
}
