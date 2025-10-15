import { useState, useEffect } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { NotificationService, type Notification } from '../../services/notification.service';
import { useAuth } from '../../context/AuthContext';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Fetch notifications
  const fetchNotifications = async () => {
    // Wait for auth to initialize
    if (authLoading) {
      return;
    }
    
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      const data = await NotificationService.getNotifications({ limit: 10 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      // Silently fail if unauthorized
    }
  };

  // Fetch on mount and when auth changes
  useEffect(() => {
    if (!authLoading) {
      fetchNotifications();
    }
  }, [authLoading, isAuthenticated]);

  // Polling every 30 seconds (only if authenticated)
  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [authLoading, isAuthenticated]);

  function toggleDropdown() {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications(); // Refresh when opening
    }
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await NotificationService.markAllAsRead();
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return notifDate.toLocaleDateString('vi-VN');
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_CREATED':
      case 'ORDER_CONFIRMED':
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
        return '📦';
      case 'ORDER_CANCELLED':
        return '❌';
      case 'COMMISSION_EARNED':
      case 'COMMISSION_PAID':
        return '💰';
      case 'WITHDRAWAL_REQUESTED':
      case 'WITHDRAWAL_APPROVED':
      case 'WITHDRAWAL_COMPLETED':
        return '💵';
      case 'WITHDRAWAL_REJECTED':
        return '⛔';
      case 'NEW_DOWNLINE':
        return '👥';
      case 'ACCOUNT_LOCKED':
        return '🔒';
      case 'ACCOUNT_UNLOCKED':
        return '🔓';
      case 'SYSTEM_ANNOUNCEMENT':
        return '📢';
      case 'PROMOTION':
        return '🎉';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
        </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Thông báo {unreadCount > 0 && `(${unreadCount})`}
          </h5>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                title="Đánh dấu đã đọc tất cả"
              >
                ✓ Đọc hết
              </button>
            )}
          <button
            onClick={toggleDropdown}
            className="text-gray-500 transition dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        </div>

        {/* Notifications List */}
        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <li className="flex items-center justify-center py-12 text-center">
              <div>
                <span className="block mb-2 text-4xl">🔔</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Chưa có thông báo nào
                </p>
              </div>
          </li>
          ) : (
            notifications.map((notification) => (
              <li key={notification.id}>
            <DropdownItem
                  onItemClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      closeDropdown();
                    }
                  }}
                  className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
                    !notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                  to={notification.actionUrl || undefined}
                >
                  {/* Icon */}
                  <span className="relative block w-10 h-10 flex-shrink-0">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-2xl dark:bg-gray-700">
                      {getNotificationIcon(notification.type)}
              </span>
                    {!notification.read && (
                      <span className="absolute bottom-0 right-0 z-10 h-2.5 w-2.5 rounded-full border-[1.5px] border-white bg-blue-500 dark:border-gray-900"></span>
                    )}
                </span>

                  {/* Content */}
                  <span className="block flex-1 min-w-0">
                    <span className="mb-1.5 block text-theme-sm text-gray-800 dark:text-white/90 font-medium">
                      {notification.title}
                </span>
                    <span className="mb-1.5 block text-theme-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {notification.message}
                </span>
                <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
                      <span>{formatTime(notification.createdAt)}</span>
                      {notification.actionText && (
                        <>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="text-blue-600 dark:text-blue-400">
                            {notification.actionText}
                </span>
                        </>
                      )}
                </span>
              </span>
            </DropdownItem>
          </li>
            ))
          )}
        </ul>

        {/* Footer - View All */}
        {notifications.length > 0 && (
          <button
            onClick={closeDropdown}
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
            Đóng
          </button>
        )}
      </Dropdown>
    </div>
  );
}
