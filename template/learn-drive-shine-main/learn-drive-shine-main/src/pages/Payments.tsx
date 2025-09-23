import { CreditCard, Calendar, CheckCircle, Clock, AlertCircle, Shield, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Payments = () => {
  const paymentSummary = {
    totalPaid: 8800,
    outstanding: 1200,
    nextDue: "2024-10-25",
    totalCourse: 10000
  };

  const payments = [
    {
      id: 1,
      type: "Registration Fee",
      amount: 500,
      dueDate: "2024-09-01",
      paidDate: "2024-08-30",
      status: "paid",
      method: "Bank Transfer"
    },
    {
      id: 2,
      type: "Theory Lessons (20 hours)",
      amount: 2000,
      dueDate: "2024-09-15",
      paidDate: "2024-09-14",
      status: "paid",
      method: "Card Payment"
    },
    {
      id: 3,
      type: "Driving Lessons (16 hours)",
      amount: 3200,
      dueDate: "2024-10-01",
      paidDate: "2024-09-28",
      status: "paid",
      method: "MAIB e-commerce"
    },
    {
      id: 4,
      type: "Practice Materials",
      amount: 300,
      dueDate: "2024-10-05",
      paidDate: "2024-10-04",
      status: "paid",
      method: "Paynet"
    },
    {
      id: 5,
      type: "Additional Driving (8 hours)",
      amount: 1600,
      dueDate: "2024-10-15",
      paidDate: "2024-10-12",
      status: "paid",
      method: "Card Payment"
    },
    {
      id: 6,
      type: "Exam Preparation",
      amount: 800,
      dueDate: "2024-10-20",
      paidDate: "2024-10-18",
      status: "paid",
      method: "MAIB e-commerce"
    },
    {
      id: 7,
      type: "Exam Fees",
      amount: 600,
      dueDate: "2024-10-25",
      paidDate: null,
      status: "pending",
      method: null
    },
    {
      id: 8,
      type: "Final Driving Hours",
      amount: 1000,
      dueDate: "2024-11-01",
      paidDate: null,
      status: "upcoming",
      method: null
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "pending":
        return <Badge className="bg-warning text-warning-foreground">Due Soon</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case "upcoming":
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const progressPercentage = (paymentSummary.totalPaid / paymentSummary.totalCourse) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
            Payment Center
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your course payments securely and keep track of your financial progress. 💳
          </p>
        </div>

        {/* Payment Summary */}
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in-up">
          <Card className="bg-gradient-success text-success-foreground shadow-glow col-span-1">
            <CardContent className="p-6 text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-3" />
              <div className="text-3xl font-bold mb-2">{paymentSummary.totalPaid} MDL</div>
              <div className="opacity-90">Total Paid</div>
              <div className="text-sm opacity-75 mt-1">
                {progressPercentage.toFixed(0)}% of course
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-border/50 shadow-card col-span-1">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-8 h-8 text-warning mx-auto mb-3" />
              <div className="text-3xl font-bold text-warning mb-2">{paymentSummary.outstanding} MDL</div>
              <div className="text-muted-foreground">Outstanding</div>
              <div className="text-sm text-muted-foreground mt-1">2 payments remaining</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border border-border/50 shadow-card col-span-1">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
              <div className="text-lg font-bold text-foreground mb-2">Oct 25, 2024</div>
              <div className="text-muted-foreground">Next Due Date</div>
              <div className="text-sm text-muted-foreground mt-1">In 3 days</div>
            </CardContent>
          </Card>
        </div>

        {/* Next Payment Alert */}
        <Card className="bg-gradient-primary text-primary-foreground shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Payment Due Soon
                </h3>
                <p className="opacity-90">
                  Your exam fee payment of <span className="font-bold">600 MDL</span> is due on October 25, 2024
                </p>
              </div>
              <Button variant="secondary" size="lg" className="animate-bounce-gentle">
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-gradient-card border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-secondary/30">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span className="font-medium">{payment.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {payment.amount} MDL
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.method || "-"}
                      </TableCell>
                      <TableCell>
                        {payment.status === "pending" && (
                          <Button size="sm">Pay Now</Button>
                        )}
                        {payment.status === "paid" && (
                          <Button size="sm" variant="outline">Receipt</Button>
                        )}
                        {payment.status === "upcoming" && (
                          <Button size="sm" variant="ghost" disabled>Upcoming</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="bg-gradient-card border border-border/50 shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Secure Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Accepted Payment Methods</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Credit Cards */}
                  <Card className="bg-secondary/30 border-border/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Cards</div>
                        <div className="text-xs text-muted-foreground">Visa • Mastercard</div>
                      </div>
                    </div>
                  </Card>

                  {/* MAIB */}
                  <Card className="bg-secondary/30 border-border/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
                        MAIB
                      </div>
                      <div>
                        <div className="font-medium text-foreground">MAIB</div>
                        <div className="text-xs text-muted-foreground">e-commerce</div>
                      </div>
                    </div>
                  </Card>

                  {/* Paynet */}
                  <Card className="bg-secondary/30 border-border/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
                        PAY
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Paynet</div>
                        <div className="text-xs text-muted-foreground">Online payments</div>
                      </div>
                    </div>
                  </Card>

                  {/* Bank Transfer */}
                  <Card className="bg-secondary/30 border-border/30 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-primary/10 rounded flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Transfer</div>
                        <div className="text-xs text-muted-foreground">Bank transfer</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Security Features
                </h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    SSL encrypted transactions
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    PCI DSS compliant processing
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Fraud protection monitoring
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Secure payment gateway
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Plan */}
        <Card className="bg-gradient-success text-success-foreground shadow-glow">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl">💳</div>
              <h3 className="text-2xl font-bold">Need a Payment Plan?</h3>
              <p className="opacity-90 max-w-md mx-auto">
                We offer flexible payment options to make your driving education more affordable. 
                Contact us to discuss installment plans.
              </p>
              <Button variant="secondary" size="lg">
                Contact Financial Advisor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;