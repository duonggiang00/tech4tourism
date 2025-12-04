import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import axios from 'axios';
import { router } from '@inertiajs/react';
import guide from '@/routes/guide';

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    data: {
        tour_id?: number;
        tour_title?: string;
        assignment_id?: number;
    };
    is_read: boolean;
    created_at: string;
}

export function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/notifications');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Refresh mỗi 30 giây
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (notificationId: number) => {
        try {
            await axios.post(`/notifications/${notificationId}/read`);
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, is_read: true }
                        : n
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post('/notifications/read-all');
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleConfirmAssignment = async (assignmentId: number, notificationId: number) => {
        try {
            await axios.post(`/assignments/${assignmentId}/confirm`);
            // Đánh dấu notification đã đọc
            await handleMarkAsRead(notificationId);
            // Refresh trang lịch trình
            router.reload();
        } catch (error) {
            console.error('Error confirming assignment:', error);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.is_read) {
            handleMarkAsRead(notification.id);
        }

        if (notification.type === 'tour_assigned' && notification.data.assignment_id) {
            // Chuyển đến trang chi tiết tour
            router.visit(guide.tripDetail(notification.data.assignment_id));
            setOpen(false);
        }
    };

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold">🔔 Thông báo</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-7 text-xs"
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Đánh dấu tất cả đã đọc
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-96">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Đang tải...
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Không có thông báo nào
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3 hover:bg-muted/50 cursor-pointer ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-medium">
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                {notification.message}
                                            </p>
                                            {notification.type === 'tour_assigned' &&
                                                notification.data.assignment_id && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-7 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleConfirmAssignment(
                                                            notification.data.assignment_id!,
                                                            notification.id
                                                        );
                                                    }}
                                                >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Xác nhận đã nhận
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(notification.created_at).toLocaleString('vi-VN')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

