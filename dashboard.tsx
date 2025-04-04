"use client";

import type React from "react";

import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Home,
  Menu,
  Truck,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HospitalDashboard() {
  const [driverName, setDriverName] = useState("");
  const [orders, setOrders] = useState([
    {
      id: 1,
      patient: "John Doe",
      destination: "Radiology",
      time: "10:30 AM",
      status: "pending",
    },
    {
      id: 2,
      patient: "Jane Smith",
      destination: "Emergency",
      time: "11:15 AM",
      status: "pending",
    },
    {
      id: 3,
      patient: "Robert Johnson",
      destination: "Cardiology",
      time: "12:00 PM",
      status: "pending",
    },
  ]);

  const [history, setHistory] = useState([
    {
      id: 101,
      patient: "Alice Brown",
      destination: "Neurology",
      time: "09:15 AM",
      status: "accepted",
    },
    {
      id: 102,
      patient: "David Wilson",
      destination: "Oncology",
      time: "08:30 AM",
      status: "rejected",
    },
    {
      id: 103,
      patient: "Emily Davis",
      destination: "Pediatrics",
      time: "07:45 AM",
      status: "accepted",
    },
  ]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Driver ${driverName} registered successfully!`);
    setDriverName("");
  };

  const handleOrderAction = (id: number, action: "accepted" | "rejected") => {
    const updatedOrders = orders.filter((order) => order.id !== id);
    const movedOrder = orders.find((order) => order.id === id);

    if (movedOrder) {
      setHistory([{ ...movedOrder, status: action }, ...history]);
      setOrders(updatedOrders);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="grid gap-6 text-lg font-medium">
              <a
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <ClipboardList className="h-6 w-6" />
                <span>Hospital Dashboard</span>
              </a>
              <a href="#" className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
              <a href="#" className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <span>Drivers</span>
              </a>
              <a href="#" className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                <span>Orders</span>
              </a>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-6 w-6" />
          <span className="text-lg font-semibold">Hospital Dashboard</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="User" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">User ID: DRV-2024</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-6 p-6 text-lg font-medium">
            <a
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <ClipboardList className="h-6 w-6" />
              <span>Hospital Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              <span>Drivers</span>
            </a>
            <a href="#" className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              <span>Orders</span>
            </a>
          </nav>
        </aside>
        <main className="flex-1 p-6 md:p-8">
          <div className="grid gap-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                Manage ambulance orders and driver registration
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Register Driver</CardTitle>
                  <CardDescription>
                    Add a new driver to the hospital system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="driver-name">Driver Name</Label>
                      <Input
                        id="driver-name"
                        placeholder="Enter driver name"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit">Register Driver</Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Driver Information</CardTitle>
                  <CardDescription>
                    Current driver status and details
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="/placeholder-user.jpg" alt="Driver" />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">Driver ID</p>
                      <p className="font-medium">DRV-2024</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Active
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Orders Today
                      </p>
                      <p className="font-medium">5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Tabs defaultValue="current">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="current">Current Orders</TabsTrigger>
                  <TabsTrigger value="history">Order History</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="current" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Patient Orders</CardTitle>
                    <CardDescription>Accept or reject requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">
                                {order.id}
                              </TableCell>
                              <TableCell>{order.patient}</TableCell>
                              <TableCell>{order.destination}</TableCell>
                              <TableCell>{order.time}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-100 text-green-800 hover:bg-green-200"
                                    onClick={() =>
                                      handleOrderAction(order.id, "accepted")
                                    }
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-100 text-red-800 hover:bg-red-200"
                                    onClick={() =>
                                      handleOrderAction(order.id, "rejected")
                                    }
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No current orders
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>
                      Past requests and their status
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {history.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">
                              {order.id}
                            </TableCell>
                            <TableCell>{order.patient}</TableCell>
                            <TableCell>{order.destination}</TableCell>
                            <TableCell>{order.time}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  order.status === "accepted"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {order.status.toUpperCase()}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
