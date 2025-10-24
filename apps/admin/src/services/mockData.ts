// Mock data for dashboard statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

export interface MessageStats {
  totalMessages: number;
  messagesToday: number;
  messagesThisWeek: number;
}

export interface CallStats {
  activeCalls: number;
  totalCalls: number;
  averageCallDuration: number;
  currentSessionStats?: {
    duration: number;
    userCount: number;
    receiveBitrate: number;
    sendBitrate: number;
    outgoingAvailableBandwidth: number;
  };
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  status: 'online' | 'offline' | 'away';
  createdAt: string;
  lastActiveAt?: string;
  role: 'admin' | 'user';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: string;
  status: 'sent' | 'delivered' | 'read';
}

// Mock data generators
const generateRandomDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@zolara.com',
    displayName: 'Admin User',
    status: 'online',
    createdAt: generateRandomDate(30),
    lastActiveAt: new Date().toISOString(),
    role: 'admin',
  },
  {
    id: '2',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    status: 'online',
    createdAt: generateRandomDate(7),
    lastActiveAt: generateRandomDate(1),
    role: 'user',
  },
  {
    id: '3',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    status: 'offline',
    createdAt: generateRandomDate(14),
    lastActiveAt: generateRandomDate(3),
    role: 'user',
  },
  {
    id: '4',
    email: 'mike.wilson@example.com',
    displayName: 'Mike Wilson',
    status: 'away',
    createdAt: generateRandomDate(1),
    lastActiveAt: generateRandomDate(0),
    role: 'user',
  },
  {
    id: '5',
    email: 'sarah.davis@example.com',
    displayName: 'Sarah Davis',
    status: 'online',
    createdAt: generateRandomDate(0),
    lastActiveAt: new Date().toISOString(),
    role: 'user',
  },
];

// Mock messages data
export const mockMessages: Message[] = Array.from({ length: 150 }, (_, i) => ({
  id: `msg_${i + 1}`,
  senderId: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
  receiverId: mockUsers[Math.floor(Math.random() * mockUsers.length)].id,
  content: `This is mock message ${i + 1}`,
  type: Math.random() > 0.8 ? 'image' : 'text',
  createdAt: generateRandomDate(7),
  status: ['sent', 'delivered', 'read'][Math.floor(Math.random() * 3)] as 'sent' | 'delivered' | 'read',
}));

// Mock statistics calculator
export const calculateUserStats = (): UserStats => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const activeUsers = mockUsers.filter(user => user.status === 'online').length;
  const newUsersToday = mockUsers.filter(user =>
    new Date(user.createdAt) >= todayStart
  ).length;
  const newUsersThisWeek = mockUsers.filter(user =>
    new Date(user.createdAt) >= weekStart
  ).length;

  return {
    totalUsers: mockUsers.length,
    activeUsers,
    newUsersToday,
    newUsersThisWeek,
  };
};

export const calculateMessageStats = (): MessageStats => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const messagesToday = mockMessages.filter(message =>
    new Date(message.createdAt) >= todayStart
  ).length;
  const messagesThisWeek = mockMessages.filter(message =>
    new Date(message.createdAt) >= weekStart
  ).length;

  return {
    totalMessages: mockMessages.length,
    messagesToday,
    messagesThisWeek,
  };
};

export const calculateCallStats = (): CallStats => {
  // Mock call statistics
  const activeCalls = Math.floor(Math.random() * 10) + 1;
  const totalCalls = Math.floor(Math.random() * 500) + 100;
  const averageCallDuration = Math.floor(Math.random() * 600) + 300; // 5-15 minutes

  // Mock current session stats (simulate an active call)
  const currentSessionStats = Math.random() > 0.5 ? {
    duration: Math.floor(Math.random() * 1800) + 60, // 1-30 minutes
    userCount: Math.floor(Math.random() * 5) + 2, // 2-6 users
    receiveBitrate: Math.floor(Math.random() * 1000) + 500, // 500-1500 kbps
    sendBitrate: Math.floor(Math.random() * 800) + 400, // 400-1200 kbps
    outgoingAvailableBandwidth: Math.floor(Math.random() * 2000) + 1000, // 1000-3000 kbps
  } : undefined;

  return {
    activeCalls,
    totalCalls,
    averageCallDuration,
    currentSessionStats,
  };
};

// Mock API delay simulation
export const mockApiDelay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Mock admin user for authentication
export const mockAdminUser = {
  id: '1',
  email: 'admin@zolara.com',
  displayName: 'Admin User',
  role: 'admin',
  token: 'mock_jwt_token_12345',
};
