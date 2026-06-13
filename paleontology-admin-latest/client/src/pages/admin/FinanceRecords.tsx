import { useState, useMemo } from "react";
import { useAdmin, type ReviewItem } from "@/contexts/AdminContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, FileText, CreditCard, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { MEMBERSHIP_STATUS_LABEL, CONFERENCE_STATUS_LABEL, CONFERENCE_STATUS_COLOR } from "@shared/constants";

const ITEMS_PER_PAGE = 10;
const COLOR_MAP = CONFERENCE_STATUS_COLOR;

function StatusBadge({ status }: { status: string }) {
  const label = MEMBERSHIP_STATUS_LABEL[status] || CONFERENCE_STATUS_LABEL[status] || status;
  const color = COLOR_MAP[status] || "bg-gray-50 text-gray-500 border border-gray-200";
  return (
    <Badge variant="outline" className={color}>
      {label}
    </Badge>
  );
}

function RecordDetailDialog({
  open,
  onOpenChange,
  record,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: ReviewItem | null;
}) {
  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>记录详情</DialogTitle>
          <DialogDescription>{record.id}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">用户邮箱：</span>
              <span>{record.userEmail}</span>
            </div>
            <div>
              <span className="text-muted-foreground">用户名：</span>
              <span>{record.userName || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">费用类型：</span>
              <Badge variant="outline" className="text-xs">
                {record.type === "society_fee" ? "会员费" : "会议费"}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground">金额：</span>
              <span className="font-semibold">¥{record.amount}</span>
            </div>
            <div>
              <span className="text-muted-foreground">目标名称：</span>
              <span>{record.targetName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">OCR金额：</span>
              <span>{record.ocrAmount !== undefined ? `¥${record.ocrAmount}` : "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">凭证提交时间：</span>
              <span>{record.submitTime || "-"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">发票截止日：</span>
              <span>{record.invoiceDeadline || "-"}</span>
            </div>
            <div className="col-span-2">
              <span className="text-muted-foreground">当前状态：</span>
              <StatusBadge status={record.status} />
            </div>
            {record.rejectReason && (
              <div className="col-span-2">
                <span className="text-muted-foreground">驳回原因：</span>
                <span className="text-party-red">{record.rejectReason}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">凭证文件</h4>
            {record.voucherUrl ? (
              <img src={record.voucherUrl} alt="Voucher" className="max-h-48 rounded border object-contain" />
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> 无凭证文件
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">发票文件</h4>
            {record.invoiceUrl ? (
              <img src={record.invoiceUrl} alt="Invoice" className="max-h-48 rounded border object-contain" />
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" /> 无发票文件
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function FinanceRecords() {
  const { getAllPaymentRecords } = useAdmin();

  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailRecord, setDetailRecord] = useState<ReviewItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const records = useMemo(() => {
    let data = getAllPaymentRecords();

    if (typeFilter !== "all") {
      data = data.filter((r) => r.type === typeFilter);
    }
    if (statusFilter !== "all") {
      data = data.filter((r) => r.status === statusFilter);
    }
    if (dateFrom) {
      data = data.filter((r) => r.submitTime >= dateFrom);
    }
    if (dateTo) {
      data = data.filter((r) => r.submitTime <= dateTo + "T23:59:59");
    }

    return data;
  }, [getAllPaymentRecords, typeFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.max(1, Math.ceil(records.length / ITEMS_PER_PAGE));
  const paginatedRecords = records.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleTypeFilter = (value: string) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleViewDetail = (record: ReviewItem) => {
    setDetailRecord(record);
    setDetailOpen(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-strata-blue-deep">财务记录</h1>
        <p className="text-muted-foreground mt-1">查看所有会员费和会议费的缴费记录</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">筛选条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Select value={typeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="全部类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="society_fee">会员费</SelectItem>
                <SelectItem value="conference_fee">会议费</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="voucher_submitted">凭证初审中</SelectItem>
                <SelectItem value="voucher_rejected">凭证被驳回</SelectItem>
                <SelectItem value="invoice_pending">待上传发票</SelectItem>
                <SelectItem value="invoice_submitted">发票终审中</SelectItem>
                <SelectItem value="invoice_rejected">发票被驳回</SelectItem>
                <SelectItem value="invoice_overdue">发票逾期</SelectItem>
                <SelectItem value="active">已开通</SelectItem>
                <SelectItem value="confirmed">已确认</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Label className="text-sm text-muted-foreground whitespace-nowrap">提交日期：</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                className="w-[150px]"
              />
              <span className="text-muted-foreground">至</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                className="w-[150px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
              <AlertCircle className="h-8 w-8" />
              <span>暂无财务记录</span>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>记录ID</TableHead>
                    <TableHead>用户</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>金额</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>凭证提交</TableHead>
                    <TableHead>发票提交</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRecords.map((r: ReviewItem) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs max-w-[120px] truncate" title={r.id}>
                        {r.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {r.userName || r.userEmail}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {r.type === "society_fee" ? "会员费" : "会议费"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {r.amount ? `¥${r.amount}` : "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {r.submitTime || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {r.invoiceDeadline || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => handleViewDetail(r)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          查看详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  共 {records.length} 条记录，第 {currentPage}/{totalPages} 页
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <RecordDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        record={detailRecord}
      />
    </div>
  );
}
