'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  CreditCard,
  DollarSign,
  FileText,
  Plus,
  Receipt,
  Search,
  TrendingUp,
  AlertCircle,
  Download,
  CheckCircle,
  Clock
} from 'lucide-react'

export default function FeeManagementPage() {
  const [selectedTerm, setSelectedTerm] = useState('term1_2025')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">
            Manage student fees, payments, and generate receipts
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term1_2025">Term 1 - 2025</SelectItem>
              <SelectItem value="term2_2025">Term 2 - 2025</SelectItem>
              <SelectItem value="term3_2025">Term 3 - 2025</SelectItem>
              <SelectItem value="term4_2025">Term 4 - 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K 245,000</div>
            <p className="text-xs text-muted-foreground">
              +8% from last term
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">K 45,000</div>
            <p className="text-xs text-muted-foreground">
              From 23 students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payments This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payment Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.5%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last term
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="define-fees" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="define-fees">Define Fees</TabsTrigger>
          <TabsTrigger value="payments">Enter Payments</TabsTrigger>
          <TabsTrigger value="receipts">View Receipts</TabsTrigger>
          <TabsTrigger value="reports">Outstanding Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="define-fees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Fee Structure Configuration</CardTitle>
                  <CardDescription>
                    Define fee types and amounts for different programs and terms
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Fee Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Fee Type</DialogTitle>
                      <DialogDescription>
                        Create a new fee type for the institution
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fee-name">Fee Name</Label>
                        <Input
                          id="fee-name"
                          placeholder="e.g., Tuition Fee, Registration Fee"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fee-amount">Amount (Kina)</Label>
                        <Input
                          id="fee-amount"
                          type="number"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="fee-category">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tuition">Tuition</SelectItem>
                            <SelectItem value="registration">Registration</SelectItem>
                            <SelectItem value="materials">Materials</SelectItem>
                            <SelectItem value="accommodation">Accommodation</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="applies-to">Applies To</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select program" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Programs</SelectItem>
                            <SelectItem value="ncv">NCV Programs</SelectItem>
                            <SelectItem value="report191">Report 191</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">Add Fee Type</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Tuition Fee</TableCell>
                    <TableCell>Tuition</TableCell>
                    <TableCell>K 2,500.00</TableCell>
                    <TableCell>All Programs</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Registration Fee</TableCell>
                    <TableCell>Registration</TableCell>
                    <TableCell>K 100.00</TableCell>
                    <TableCell>All Programs</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Materials Fee</TableCell>
                    <TableCell>Materials</TableCell>
                    <TableCell>K 350.00</TableCell>
                    <TableCell>NCV Programs</TableCell>
                    <TableCell>
                      <Badge variant="default">Active</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Entry</CardTitle>
                  <CardDescription>
                    Record student fee payments and generate receipts
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Record Student Payment</DialogTitle>
                      <DialogDescription>
                        Enter payment details for a student
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="student-id">Student ID</Label>
                        <Input
                          id="student-id"
                          placeholder="Enter student ID or search"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="payment-amount">Payment Amount (Kina)</Label>
                        <Input
                          id="payment-amount"
                          type="number"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="eftpos">EFTPOS</SelectItem>
                            <SelectItem value="cheque">Cheque</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="reference">Reference Number</Label>
                        <Input
                          id="reference"
                          placeholder="Optional reference/transaction ID"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Cancel</Button>
                      <Button type="submit">Record Payment</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or ID..."
                  className="max-w-sm"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2025-01-15</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">John Kaupa</p>
                        <p className="text-sm text-muted-foreground">STU001234</p>
                      </div>
                    </TableCell>
                    <TableCell>K 2,500.00</TableCell>
                    <TableCell>Bank Transfer</TableCell>
                    <TableCell>TXN123456</TableCell>
                    <TableCell>
                      <Badge variant="default">Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Receipt className="mr-1 h-3 w-3" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2025-01-14</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Mary Temu</p>
                        <p className="text-sm text-muted-foreground">STU001235</p>
                      </div>
                    </TableCell>
                    <TableCell>K 1,250.00</TableCell>
                    <TableCell>Cash</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Badge variant="default">Completed</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">
                        <Receipt className="mr-1 h-3 w-3" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receipts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Receipts</CardTitle>
              <CardDescription>
                View and download payment receipts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search receipts..."
                    className="max-w-sm"
                  />
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export All
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>RCP-001234</TableCell>
                    <TableCell>2025-01-15</TableCell>
                    <TableCell>John Kaupa</TableCell>
                    <TableCell>K 2,500.00</TableCell>
                    <TableCell>Bank Transfer</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>RCP-001235</TableCell>
                    <TableCell>2025-01-14</TableCell>
                    <TableCell>Mary Temu</TableCell>
                    <TableCell>K 1,250.00</TableCell>
                    <TableCell>Cash</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Fees Report</CardTitle>
              <CardDescription>
                Track students with outstanding fee payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="max-w-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Total Fees</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Peter Namaliu</p>
                        <p className="text-sm text-muted-foreground">STU001236</p>
                      </div>
                    </TableCell>
                    <TableCell>Electrical Engineering</TableCell>
                    <TableCell>K 3,000.00</TableCell>
                    <TableCell>K 1,500.00</TableCell>
                    <TableCell className="text-red-600 font-medium">K 1,500.00</TableCell>
                    <TableCell>
                      <Badge variant="destructive">15 days</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Send Notice</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <div>
                        <p className="font-medium">Sarah Kila</p>
                        <p className="text-sm text-muted-foreground">STU001237</p>
                      </div>
                    </TableCell>
                    <TableCell>Business Studies</TableCell>
                    <TableCell>K 2,800.00</TableCell>
                    <TableCell>K 2,000.00</TableCell>
                    <TableCell className="text-orange-600 font-medium">K 800.00</TableCell>
                    <TableCell>
                      <Badge variant="secondary">3 days</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm">Send Notice</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
