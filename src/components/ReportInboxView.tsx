import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { 
  Inbox, 
  Search, 
  Download, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  MessageSquare,
  Lightbulb,
  ThumbsUp,
  User,
  FileText,
  Send,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { User } from "../App";
import { reportApi } from "../features/report/api/reportApi";
import type { Report, ReportType, ReportStatus } from "../features/report/types/report";

interface ReportInboxViewProps {
  user: User;
}

export function ReportInboxView({ user }: ReportInboxViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("all");
  const [filterType, setFilterType] = useState<ReportType | "all">("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [responseText, setResponseText] = useState("");
  const [assignedReviewer, setAssignedReviewer] = useState("");
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const filters: { type?: string; status?: string } = {};
        if (filterType !== "all") filters.type = filterType;
        if (filterStatus !== "all") filters.status = filterStatus;
        
        const data = await reportApi.getReports(filters);
        setReports(data);
      } catch (error: any) {
        console.error('Error fetching reports:', error);
        toast.error('ไม่สามารถโหลดรายงานได้ กรุณาลองอีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, [filterType, filterStatus]);

  const availableReviewers = [
    "Super Admin",
    "Finance Team",
    "Facilities Manager",
    "Event Coordinator",
  ];

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (report.sender?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      `RPT-${String(report.id).padStart(3, '0')}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getTypeIcon = (type: ReportType) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="h-4 w-4" />;
      case "complaint":
      case "issue":
        return <AlertCircle className="h-4 w-4" />;
      case "appreciation":
        return <ThumbsUp className="h-4 w-4" />;
      case "question":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: ReportType) => {
    const colors: Record<ReportType, string> = {
      suggestion: "bg-blue-100 text-blue-700",
      complaint: "bg-red-100 text-red-700",
      issue: "bg-orange-100 text-orange-700",
      question: "bg-purple-100 text-purple-700",
      appreciation: "bg-green-100 text-green-700",
      feedback: "bg-gray-100 text-gray-700",
    };
    return (
      <Badge className={`${colors[type]} whitespace-nowrap flex-shrink-0`}>
        {getTypeIcon(type)}
        <span className="ml-1 capitalize hidden sm:inline">{type}</span>
        <span className="ml-1 capitalize sm:hidden">{type.substring(0, 3)}</span>
      </Badge>
    );
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 whitespace-nowrap flex-shrink-0 text-xs">
            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">New</span>
            <span className="sm:hidden">ใหม่</span>
          </Badge>
        );
      case "in-review":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 whitespace-nowrap flex-shrink-0 text-xs">
            <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">กำลังตรวจสอบ</span>
            <span className="sm:hidden">ตรวจสอบ</span>
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 whitespace-nowrap flex-shrink-0 text-xs">
            <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">แก้ไขแล้ว</span>
            <span className="sm:hidden">แก้ไข</span>
          </Badge>
        );
      default:
        return <Badge className="whitespace-nowrap flex-shrink-0 text-xs">{status}</Badge>;
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReport || !assignedReviewer) {
      toast.error("กรุณาเลือกผู้ตรวจสอบ");
      return;
    }

    try {
      const updatedReport = await reportApi.updateReportStatus(selectedReport.id, {
        status: "in-review",
        assignedTo: assignedReviewer,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? updatedReport : r))
      );
      setSelectedReport(updatedReport);
      toast.success(`มอบหมายรายงานให้ ${assignedReviewer} แล้ว`);
      setAssignedReviewer("");
    } catch (error: any) {
      console.error('Error assigning reviewer:', error);
      toast.error('ไม่สามารถมอบหมายผู้ตรวจสอบได้ กรุณาลองอีกครั้ง');
    }
  };

  const handleMarkResolved = async () => {
    if (!selectedReport) return;

    try {
      const updatedReport = await reportApi.updateReportStatus(selectedReport.id, {
        status: "resolved",
      });
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? updatedReport : r))
      );
      setSelectedReport(updatedReport);
      toast.success("ทำเครื่องหมายรายงานว่าแก้ไขแล้ว");
    } catch (error: any) {
      console.error('Error marking resolved:', error);
      toast.error('ไม่สามารถอัปเดตสถานะได้ กรุณาลองอีกครั้ง');
    }
  };

  const handleSendResponse = async () => {
    if (!selectedReport || !responseText.trim()) {
      toast.error("กรุณากรอกคำตอบ");
      return;
    }

    try {
      const updatedReport = await reportApi.updateReportResponse(selectedReport.id, {
        response: responseText,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? updatedReport : r))
      );
      setSelectedReport(updatedReport);
      toast.success("ส่งคำตอบสำเร็จแล้ว");
      setResponseText("");
      setIsResponseDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending response:', error);
      toast.error('ไม่สามารถส่งคำตอบได้ กรุณาลองอีกครั้ง');
    }
  };

  const handleExportCSV = () => {
    // Mock CSV export
    toast.success("กำลังส่งออกรายงานเป็น CSV...");
  };

  const stats = {
    total: Array.isArray(reports) ? reports.length : 0,
    new: Array.isArray(reports) ? reports.filter((r) => r && r.status === "new").length : 0,
    inReview: Array.isArray(reports) ? reports.filter((r) => r && r.status === "in-review").length : 0,
    resolved: Array.isArray(reports) ? reports.filter((r) => r && r.status === "resolved").length : 0,
  };

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="mb-2 text-xl md:text-2xl">Report Inbox</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            กล่องข้อความรวมศูนย์สำหรับรายงาน ปัญหา และข้อเสนอแนะทั้งหมด
          </p>
        </div>
        <Button onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">ส่งออก CSV</span>
          <span className="sm:hidden">ส่งออก</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">รายงานทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">ใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl text-blue-600">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">กำลังตรวจสอบ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl text-yellow-600">{stats.inReview}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">แก้ไขแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาตามหัวข้อ ผู้ส่ง หรือรหัส..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={filterStatus} onValueChange={(value: ReportStatus | "all") => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="สถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">สถานะทั้งหมด</SelectItem>
                  <SelectItem value="new">ใหม่</SelectItem>
                  <SelectItem value="in-review">กำลังตรวจสอบ</SelectItem>
                  <SelectItem value="resolved">แก้ไขแล้ว</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={(value: ReportType | "all") => setFilterType(value)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="ประเภท" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ประเภททั้งหมด</SelectItem>
                  <SelectItem value="suggestion">ข้อเสนอแนะ</SelectItem>
                  <SelectItem value="complaint">ข้อร้องเรียน</SelectItem>
                  <SelectItem value="issue">ปัญหา</SelectItem>
                  <SelectItem value="question">คำถาม</SelectItem>
                  <SelectItem value="appreciation">คำชม</SelectItem>
                  <SelectItem value="feedback">ข้อเสนอแนะ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Reports Table - Desktop */}
        <Card className="hidden md:block">
          <CardHeader>
            <CardTitle>รายงาน</CardTitle>
            <CardDescription>
              พบ {filteredReports.length} รายงาน
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>รหัส</TableHead>
                      <TableHead>ประเภท</TableHead>
                      <TableHead>หัวข้อ</TableHead>
                      <TableHead>ผู้ส่ง</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead>วันที่</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                          ไม่พบรายงาน
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredReports.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedReport(report)}
                    >
                      <TableCell>
                        <code className="text-xs">RPT-{String(report.id).padStart(3, '0')}</code>
                      </TableCell>
                      <TableCell>{getTypeBadge(report.type)}</TableCell>
                      <TableCell>
                        <p className="font-medium text-sm truncate max-w-[200px]">{report.subject}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm truncate max-w-[150px]">{report.sender.name}</p>
                          {report.sender.club && (
                            <p className="text-xs text-muted-foreground truncate max-w-[150px]">{report.sender.club}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(report.createdAt).toLocaleDateString("th-TH")}
                        </span>
                      </TableCell>
                      </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reports Cards - Mobile */}
        <div className="md:hidden w-full min-w-0 overflow-hidden">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>รายงาน</CardTitle>
              <CardDescription>
                พบ {filteredReports.length} รายงาน
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground px-4">
                  ไม่พบรายงาน
                </div>
              ) : (
                <div className="space-y-3 px-4 pb-4">
                  {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors w-full overflow-hidden"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                      <div className="flex-1 min-w-0 pr-2">
                        <code className="text-xs text-muted-foreground block truncate">RPT-{String(report.id).padStart(3, '0')}</code>
                        <p className="font-medium text-sm mt-1 truncate">{report.subject}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {getStatusBadge(report.status)}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <div className="flex-shrink-0">
                        {getTypeBadge(report.type)}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(report.createdAt).toLocaleDateString("th-TH")}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">{report.sender?.name || 'Unknown'}</p>
                      {report.sender?.club && (
                        <p className="text-xs text-muted-foreground truncate">{report.sender.club}</p>
                      )}
                    </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detail View */}
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดรายงาน</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReport ? (
              <div className="space-y-4">
                <div>
                  <Label>รหัสรายงาน</Label>
                  <p className="text-sm font-mono">RPT-{String(selectedReport.id).padStart(3, '0')}</p>
                </div>
                <div>
                  <Label>ประเภท</Label>
                  <div className="mt-1">{getTypeBadge(selectedReport.type)}</div>
                </div>
                <div>
                  <Label>หัวข้อ</Label>
                  <p className="text-sm font-medium mt-1">{selectedReport.subject}</p>
                </div>
                <div>
                  <Label>ผู้ส่ง</Label>
                  <div className="mt-1">
                    <p className="text-sm">{selectedReport.sender?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{selectedReport.sender?.email || ''}</p>
                    {selectedReport.sender?.club && (
                      <p className="text-xs text-muted-foreground">{selectedReport.sender.club}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label>ข้อความ</Label>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                    {selectedReport.message}
                  </p>
                </div>
                <div>
                  <Label>สถานะ</Label>
                  <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                </div>
                {selectedReport.assignedTo && (
                  <div>
                    <Label>มอบหมายให้</Label>
                    <p className="text-sm mt-1">{selectedReport.assignedTo}</p>
                  </div>
                )}
                {selectedReport.response && (
                  <div>
                    <Label>คำตอบ</Label>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                      {selectedReport.response}
                    </p>
                    {selectedReport.responseDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(selectedReport.responseDate).toLocaleString("th-TH")}
                      </p>
                    )}
                  </div>
                )}
                <div className="pt-4 border-t space-y-2">
                  {selectedReport.status === "new" && (
                    <div className="space-y-2">
                      <Label>มอบหมายผู้ตรวจสอบ</Label>
                      <Select value={assignedReviewer} onValueChange={setAssignedReviewer}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกผู้ตรวจสอบ..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableReviewers.map((reviewer) => (
                            <SelectItem key={reviewer} value={reviewer}>
                              {reviewer}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAssignReviewer} className="w-full" size="sm">
                        มอบหมายผู้ตรวจสอบ
                      </Button>
                    </div>
                  )}
                  {selectedReport.status === "in-review" && (
                    <>
                      <Button onClick={handleMarkResolved} className="w-full" size="sm" variant="outline">
                        ทำเครื่องหมายว่าแก้ไขแล้ว
                      </Button>
                      <Button 
                        onClick={() => setIsResponseDialogOpen(true)} className="w-full" size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        ส่งคำตอบ
                      </Button>
                    </>
                  )}
                  {selectedReport.status === "new" && (
                    <Button 
                      onClick={() => setIsResponseDialogOpen(true)} className="w-full" size="sm" variant="outline"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      ส่งคำตอบ
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Inbox className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">เลือกรายงานเพื่อดูรายละเอียด</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send Response Dialog */}
      {selectedReport && (
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ส่งคำตอบติดตาม</DialogTitle>
              <DialogDescription>
                ตอบกลับ {selectedReport.sender.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>ข้อความตอบกลับ</Label>
                <Textarea
                  rows={6}
                  placeholder="กรอกคำตอบของคุณ..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => {
                  handleSendResponse();
                  setIsResponseDialogOpen(false);
                }} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  ส่งคำตอบ
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsResponseDialogOpen(false);
                  setResponseText("");
                }}>
                  ยกเลิก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

