"use client";
import * as React from "react";
import { CreditCard, Landmark, Smartphone, Loader2, CheckCircle2, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";

export function PaymentDialog({
  open,
  onOpenChange,
  applicationNumber,
  amount,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  applicationNumber: string;
  amount: number;
}) {
  const [processing, setProcessing] = React.useState(false);
  const [paid, setPaid] = React.useState(false);
  const [receiptNo, setReceiptNo] = React.useState("");

  async function handlePay() {
    setProcessing(true);
    // In production: paymentsApi.initiate() then paymentsApi.confirm()
    await new Promise((r) => setTimeout(r, 1200));
    setReceiptNo(`RCPT/${Date.now().toString().slice(-8)}`);
    setPaid(true);
    setProcessing(false);
  }

  function handleClose(v: boolean) {
    if (!v) {
      setPaid(false);
      setReceiptNo("");
    }
    onOpenChange(v);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {!paid ? (
          <>
            <DialogHeader>
              <DialogTitle>Pay Application Fee</DialogTitle>
              <DialogDescription>Application {applicationNumber} · Amount ₹{amount}</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="upi">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upi"><Smartphone className="mr-1.5 h-3.5 w-3.5" />UPI</TabsTrigger>
                <TabsTrigger value="card"><CreditCard className="mr-1.5 h-3.5 w-3.5" />Card</TabsTrigger>
                <TabsTrigger value="netbanking"><Landmark className="mr-1.5 h-3.5 w-3.5" />Net Banking</TabsTrigger>
              </TabsList>

              <TabsContent value="upi" className="space-y-3">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input id="upi-id" placeholder="yourname@upi" />
              </TabsContent>
              <TabsContent value="card" className="space-y-3">
                <Label htmlFor="card-number">Card Number</Label>
                <Input id="card-number" placeholder="1234 5678 9012 3456" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input id="expiry" placeholder="MM/YY" />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" type="password" placeholder="•••" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="netbanking" className="space-y-3">
                <Label htmlFor="bank">Select Bank</Label>
                <Input id="bank" placeholder="e.g. State Bank of India" />
              </TabsContent>
            </Tabs>

            <Button className="mt-5 w-full" size="lg" onClick={handlePay} disabled={processing}>
              {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
              {processing ? "Processing Payment..." : `Pay ₹${amount}`}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              This is a demo gateway. No real transaction will be made.
            </p>
          </>
        ) : (
          <div className="py-2 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="mb-1">Payment Successful</DialogTitle>
            <p className="mb-4 text-sm text-muted-foreground">₹{amount} paid for {applicationNumber}</p>
            <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4 text-left text-sm">
              <Row label="Receipt No." value={receiptNo} />
              <Row label="Application No." value={applicationNumber} />
              <Row label="Amount Paid" value={`₹${amount}`} />
              <Row label="Date" value={formatDate(new Date())} />
              <Row label="Status" value="Success" />
            </div>
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4" /> Download Receipt
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-border/60 py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
