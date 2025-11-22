/**
 * Helper to handle API responses that create notifications
 * Automatically checks for notification header and broadcasts event
 */
export async function handleNotificationResponse(response: Response) {
  if (response.headers.get('X-Notification-Created') === 'true') {
    // Dispatch custom event for notification creation
    window.dispatchEvent(new CustomEvent('notificationCreated'));
  }
  return response;
}

/**
 * Wrapper for fetch that auto-handles notification events
 */
export async function fetchWithNotification(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  await handleNotificationResponse(response);
  return response;
}
