import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Avatar, AvatarImage, AvatarFallback, getDiceBearAvatar } from "./ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Search, Users, TrendingUp, Eye, Edit, CheckCircle } from "lucide-react";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import type { User } from "../App";

interface ClubManagementViewProps {
  user: User;
}

interface Club {
  id: string;
  name: string;
  category: string;
  president: string;
  memberCount: number;
  activeRate: number;
  status: "active" | "pending" | "inactive";
  lastActivity: string;
}

export function ClubManagementView({ user }: ClubManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewClubOpen, setIsNewClubOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  const [clubs] = useState<Club[]>([
    {
      id: "club-1",
      name: "ชมรมดนตรีสากล",
      category: "Arts & Music",
      president: "สมหญิง หัวหน้า",
      memberCount: 48,
      activeRate: 85,
      status: "active",
      lastActivity: "2025-11-07",
    },
    {
      id: "club-2",
      name: "ชมรมภาพถ่าย",
      category: "Arts & Media",
      president: "วิชัย ช่างภาพ",
      memberCount: 35,
      activeRate: 78,
      status: "active",
      lastActivity: "2025-11-06",
    },
    {
      id: "club-3",
      name: "ชมรมหุ่นยนต์",
      category: "Technology",
      president: "ธนพล วิศวกร",
      memberCount: 42,
      activeRate: 92,
      status: "active",
      lastActivity: "2025-11-07",
    },
    {
      id: "club-4",
      name: "ชมรมอาสาพัฒนา",
      category: "Community Service",
      president: "นภา ใจดี",
      memberCount: 56,
      activeRate: 88,
      status: "active",
      lastActivity: "2025-11-05",
    },
    {
      id: "club-5",
      name: "ชมรมกีฬาแบดมินตัน",
      category: "Sports",
      president: "ศิริพร นักกีฬา",
      memberCount: 62,
      activeRate: 90,
      status: "active",
      lastActivity: "2025-11-07",
    },
    {
      id: "club-6",
      name: "ชมรมภาษาญี่ปุ่น",
      category: "Language & Culture",
      president: "พิมพ์ใจ ซากุระ",
      memberCount: 38,
      activeRate: 82,
      status: "active",
      lastActivity: "2025-11-04",
    },
    {
      id: "club-7",
      name: "ชมรมการ์ตูนและอนิเมะ",
      category: "Arts & Media",
      president: "ประภาส มังงะ",
      memberCount: 45,
      activeRate: 75,
      status: "active",
      lastActivity: "2025-11-03",
    },
    {
      id: "club-8",
      name: "ชมรมธุรกิจและการลงทุน",
      category: "Business",
      president: "สมชาย นักธุรกิจ",
      memberCount: 52,
      activeRate: 80,
      status: "active",
      lastActivity: "2025-11-06",
    },
  ]);

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    club.president.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 whitespace-nowrap flex-shrink-0 text-xs">
            <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="hidden sm:inline">ใช้งานอยู่</span>
            <span className="sm:hidden">ใช้งาน</span>
          </Badge>
        );
      case "pending":
        return <Badge variant="outline" className="whitespace-nowrap flex-shrink-0 text-xs">รอ</Badge>;
      case "inactive":
        return <Badge variant="outline" className="whitespace-nowrap flex-shrink-0 text-xs">ไม่ใช้งาน</Badge>;
      default:
        return <Badge className="whitespace-nowrap flex-shrink-0 text-xs">{status}</Badge>;
    }
  };

  const handleSubmitNewClub = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("สร้างชมรมใหม่สำเร็จแล้ว!");
    setIsNewClubOpen(false);
  };

  const totalMembers = clubs.reduce((sum, club) => sum + club.memberCount, 0);
  const averageActiveRate = Math.round(
    clubs.reduce((sum, club) => sum + club.activeRate, 0) / clubs.length
  );

  return (
    <div className="p-4 md:p-8 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="mb-2 text-xl md:text-2xl">Club Management</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            จัดการชมรมทั้งหมดในมหาวิทยาลัยและกิจกรรม
          </p>
        </div>
        <Dialog open={isNewClubOpen} onOpenChange={setIsNewClubOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              สร้างชมรมใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>สร้างชมรมใหม่</DialogTitle>
              <DialogDescription>
                ลงทะเบียนชมรมใหม่ในระบบ
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitNewClub} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="club-name">ชื่อชมรม</Label>
                <Input
                  id="club-name"
                  placeholder="กรอกชื่อชมรม"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-category">หมวดหมู่</Label>
                <Select required>
                  <SelectTrigger id="club-category">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arts">ศิลปะและดนตรี</SelectItem>
                    <SelectItem value="media">ศิลปะและสื่อ</SelectItem>
                    <SelectItem value="tech">เทคโนโลยี</SelectItem>
                    <SelectItem value="service">บริการสังคม</SelectItem>
                    <SelectItem value="sports">กีฬา</SelectItem>
                    <SelectItem value="language">ภาษาและวัฒนธรรม</SelectItem>
                    <SelectItem value="business">ธุรกิจ</SelectItem>
                    <SelectItem value="other">อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-president">ชื่อประธาน</Label>
                <Input
                  id="club-president"
                  placeholder="กรอกชื่อประธาน"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="club-description">คำอธิบาย</Label>
                <Textarea
                  id="club-description"
                  placeholder="อธิบายวัตถุประสงค์และกิจกรรมของชมรม"
                  rows={3}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" className="flex-1">สร้างชมรม</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsNewClubOpen(false)}
                  className="flex-1 sm:flex-none"
                >
                  ยกเลิก
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">ชมรมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl">{clubs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ชมรมที่ลงทะเบียน
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">สมาชิกทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl">{totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ทุกชมรม
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs md:text-sm">อัตราการใช้งานเฉลี่ย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl text-green-600">{averageActiveRate}%</div>
            <Progress value={averageActiveRate} className="h-1 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชมรมตามชื่อ หมวดหมู่ หรือประธาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clubs Table - Desktop */}
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>ชมรมทั้งหมด</CardTitle>
          <CardDescription>
            พบ {filteredClubs.length} ชมรม
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชมรม</TableHead>
                  <TableHead>ประธาน</TableHead>
                  <TableHead>สมาชิก</TableHead>
                  <TableHead>อัตราการใช้งาน</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>การดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClubs.map((club) => (
                  <TableRow key={club.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={getDiceBearAvatar(club.name)} />
                          <AvatarFallback>
                            {club.name.substring(4, 6)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{club.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">{club.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]">{club.president}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{club.memberCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <span className="text-sm">{club.activeRate}%</span>
                        <Progress value={club.activeRate} className="h-1 w-16" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(club.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedClub(club)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Clubs Cards - Mobile */}
      <div className="md:hidden w-full min-w-0 overflow-hidden">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>ชมรมทั้งหมด</CardTitle>
            <CardDescription>
              พบ {filteredClubs.length} ชมรม
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-3 px-4 pb-4">
              {filteredClubs.map((club) => (
                <div
                  key={club.id}
                  className="p-3 border rounded-lg hover:bg-slate-50 transition-colors w-full overflow-hidden"
                  onClick={() => setSelectedClub(club)}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="shrink-0">
                      <AvatarImage src={getDiceBearAvatar(club.name)} />
                      <AvatarFallback>
                        {club.name.substring(4, 6)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="font-medium text-sm truncate">{club.name}</p>
                          <p className="text-xs text-muted-foreground truncate mt-1">{club.category}</p>
                        </div>
                        {getStatusBadge(club.status)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p className="truncate">ประธาน: {club.president}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center justify-between">
                      <span>อัตราการใช้งาน</span>
                      <span className="font-medium">{club.activeRate}%</span>
                    </div>
                    <Progress value={club.activeRate} className="h-1" />
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {club.memberCount} สมาชิก
                      </span>
                      <span>กิจกรรมล่าสุด: {new Date(club.lastActivity).toLocaleDateString("th-TH")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClub(club);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      ดูรายละเอียด
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs flex-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      แก้ไข
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Club Detail Dialog */}
      <Dialog open={!!selectedClub} onOpenChange={() => setSelectedClub(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedClub && (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Avatar className="h-16 w-16 shrink-0">
                    <AvatarImage src={getDiceBearAvatar(selectedClub.name)} />
                    <AvatarFallback className="text-xl">
                      {selectedClub.name.substring(4, 6)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="truncate">{selectedClub.name}</DialogTitle>
                    <DialogDescription>
                      <Badge variant="outline" className="mt-1">{selectedClub.category}</Badge>
                    </DialogDescription>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(selectedClub.status)}
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">สมาชิก</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl sm:text-2xl">{selectedClub.memberCount}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">อัตราการใช้งาน</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xl sm:text-2xl text-green-600">{selectedClub.activeRate}%</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">ประธาน</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm truncate">{selectedClub.president}</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
                  <span className="text-muted-foreground">กิจกรรมล่าสุด:</span>
                  <span>{new Date(selectedClub.lastActivity).toLocaleDateString('th-TH')}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
