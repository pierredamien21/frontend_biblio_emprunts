"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { fetchApi } from "@/lib/api-client"
import { Notification } from "@/lib/types"
import { cn } from "@/lib/utils"

export function NotificationsPopover() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const fetchNotifications = async () => {
        setIsLoading(true)
        try {
            const data = await fetchApi("/notifications/")
            setNotifications(data)
            setUnreadCount(data.filter((n: Notification) => !n.lu).length)
        } catch (error) {
            console.error("Failed to fetch notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        // Initial fetch
        fetchNotifications()

        // Refresh every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const markAsRead = async (id: number) => {
        try {
            await fetchApi(`/notifications/${id}/lu`, { method: "PATCH" })

            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id_notification === id ? { ...n, lu: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Failed to mark notification as read:", error)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (open) fetchNotifications()
        }}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-3 h-3 bg-destructive rounded-full border-2 border-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {unreadCount} nouvelle(s)
                        </Badge>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading && notifications.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Chargement...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                            <Bell className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">Aucune notification pour le moment</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id_notification}
                                    className={cn(
                                        "p-4 transition-colors hover:bg-muted/50 cursor-pointer",
                                        !notif.lu ? "bg-[#0B5FFF]/5" : "bg-transparent"
                                    )}
                                    onClick={() => !notif.lu && markAsRead(notif.id_notification)}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", !notif.lu ? "text-[#0B5FFF]" : "text-foreground")}>
                                                {notif.titre}
                                            </p>
                                            <p className="text-xs text-muted-foreground leading-snug">
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground pt-1">
                                                {new Date(notif.date_notif).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {!notif.lu && (
                                            <div className="mt-1">
                                                <span className="w-2 h-2 rounded-full bg-[#0B5FFF] block" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
