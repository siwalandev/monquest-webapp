/**
 * Test script untuk create notifications via API
 * Usage: npm run dev, kemudian buka browser console dan paste code ini
 */

// Get token from localStorage
const token = localStorage.getItem("token");
const userId = JSON.parse(localStorage.getItem("admin_user") || "{}").id;

// Create test notifications
const testNotifications = [
  {
    userId: userId,
    type: "SUCCESS",
    title: "Content Updated",
    message: "Hero section has been successfully updated with new content",
  },
  {
    userId: userId,
    type: "INFO",
    title: "New User Registration",
    message: "A new user has registered on the platform",
  },
  {
    userId: null, // Broadcast to all
    type: "WARNING",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Sunday at 2 AM UTC",
  },
  {
    userId: userId,
    type: "ERROR",
    title: "API Key Expiring",
    message: "Your API key will expire in 7 days. Please renew it soon.",
  },
];

// Create notifications
async function createTestNotifications() {
  for (const notification of testNotifications) {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(notification),
      });

      const result = await response.json();
      console.log("Created:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  }
}

createTestNotifications();
