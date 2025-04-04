"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, ChevronDown, ClipboardList, Home, LogOut, Menu, Truck, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase, type Order, type Profile } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export default function HospitalDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [driverName, setDriverName] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [history, setHistory] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in with Supabase
    const fetchUserAndData = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized. Please check your environment variables.")
        }

        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          throw new Error("Not authenticated")
        }

        setUser(user)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (profileError) throw profileError

        setProfile(profileData)

        // Get pending orders
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false })

        if (ordersError) throw ordersError

        setOrders(ordersData || [])

        // Get order history for this driver
        const { data: historyData, error: historyError } = await supabase
          .from("orders")
          .select("*")
          .in("status", ["accepted", "rejected"])
          .eq("driver_id", user.id)
          .order("updated_at", { ascending: false })

        if (historyError) throw historyError

        setHistory(historyData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        // Redirect to login if not authenticated
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndData()

    // Set up real-time subscription for orders
    if (supabase) {
      const ordersSubscription = supabase
        .channel("orders-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "orders",
            filter: "status=eq.pending",
          },
          (payload) => {
            // Update orders when there are changes
            if (payload.eventType === "INSERT") {
              setOrders((prev) => [payload.new as Order, ...prev])
            } else if (payload.eventType === "DELETE") {
              setOrders((prev) => prev.filter((order) => order.id !== payload.old.id))
            }
          },
        )
        .subscribe()

      return () => {
        // Clean up subscription
        supabase.removeChannel(ordersSubscription)
      }
    }
  }, [router])

  const handleLogout = async () => {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to log out",
        variant: "destructive",
      })
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!driverName.trim()) {
      toast({
        title: "Error",
        description: "Driver name is required",
        variant: "destructive",
      })
      return
    }

    try {
      // In a real app, this would create a new driver account
      // For this demo, we'll just show a success message
      toast({
        title: "Success",
        description: `Driver ${driverName} registered successfully!`,
      })
      setDriverName("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to register driver",
        variant: "destructive",
      })
    }
  }

  const handleOrderAction = async (orderId: number, action: "accepted" | "rejected") => {
    if (!user || !profile || !supabase) return

    try {
      // Update the order status in the database
      const { error } = await supabase
        .from("orders")
        .update({
          status: action,
          driver_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      // Update local state
      const updatedOrder = orders.find((order) => order.id === orderId)

      if (updatedOrder) {
        // Remove from pending orders
        setOrders(orders.filter((order) => order.id !== orderId))

        // Add to history
        setHistory([{ ...updatedOrder, status: action, driver_id: user.id }, ...history])

        // Update orders_today count
        if (action === "accepted") {
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              orders_today: (profile.orders_today || 0) + 1,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)

          if (profileError) throw profileError

          // Update local profile state
          setProfile({
            ...profile,
            orders_today: (profile.orders_today || 0) + 1,
          })
        }

        toast({
          title: "Success",
          description: `Order ${orderId} ${action}`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${action} order`,
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!user || !profile) {
    return <div className="flex min-h-screen items-center justify-center">Not authenticated</div>
  }

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
              <a href="#" className="flex items-center gap-2 text-lg font-semibold">
                <ClipboardList className="h-6 w-6" />
                <span>Hospital Transport</span>
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
          <span className="text-lg font-semibold">Hospital Transport</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 p-1 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile.avatar_url || ""} alt="User" />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium">User ID: {user.id.substring(0, 8)}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="flex items-center gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile Settings</DropdownMenuItem>
              <DropdownMenuItem>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-6 p-6 text-lg font-medium">
            <a href="#" className="flex items-center gap-2 text-lg font-semibold">
              <ClipboardList className="h-6 w-6" />
              <span>Hospital Transport</span>
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
              <p className="text-muted-foreground">Manage patient transport orders and driver registration</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Register Driver</CardTitle>
                  <CardDescription>Add a new driver to the transport system</CardDescription>
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
                  <CardDescription>Current driver status and details</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={profile.avatar_url || ""} alt="Driver" />
                      <AvatarFallback>
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">Driver ID</p>
                      <p className="font-medium">{user.id.substring(0, 8)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">
                        <Badge
                          variant="outline"
                          className={
                            profile.status === "active"
                              ? "bg-green-100 text-green-800"
                              : profile.status === "on_leave"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {profile.status.toUpperCase().replace("_", " ")}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Orders Today</p>
                      <p className="font-medium">{profile.orders_today || 0}</p>
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
                    <CardDescription>Accept or reject transport requests</CardDescription>
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
                              <TableCell className="font-medium">{order.id}</TableCell>
                              <TableCell>{order.patient}</TableCell>
                              <TableCell>{order.destination}</TableCell>
                              <TableCell>{order.time}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-green-100 text-green-800 hover:bg-green-200"
                                    onClick={() => handleOrderAction(order.id, "accepted")}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-red-100 text-red-800 hover:bg-red-200"
                                    onClick={() => handleOrderAction(order.id, "rejected")}
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
                    <CardDescription>Past transport requests and their status</CardDescription>
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
                        {history.length > 0 ? (
                          history.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.id}</TableCell>
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
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No order history
                            </TableCell>
                          </TableRow>
                        )}
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
  )
}

