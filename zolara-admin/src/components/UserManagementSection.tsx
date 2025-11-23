import React, { useState, useEffect } from "react";
import {
  Search,
  Shield,
  ShieldOff,
  Users,
  AlertTriangle,
  Ban,
} from "lucide-react";
import { apiService } from "../services/api";

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  phoneNumber?: string;
  blockDate?: string;
  createdAt: string;
  role?: string;
  userInfo?: {
    fullName?: string;
    profilePictureUrl?: string;
    coverImgUrl?: string;
    bio?: string;
  };
}

interface UserManagementSectionProps {
  isLoading?: boolean;
}

const UserManagementSection: React.FC<UserManagementSectionProps> = ({
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"email" | "phone">("email");
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockDuration, setBlockDuration] = useState<string>("1");
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);

  // Load blocked users on component mount
  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    setIsLoadingBlocked(true);
    try {
      const response = await apiService.getBlockedUsers();
      setBlockedUsers(response.data || []);
    } catch (error: unknown) {
      setError("Failed to load blocked users");
      console.error("Error loading blocked users:", error);
    } finally {
      setIsLoadingBlocked(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const searchData =
        searchType === "email"
          ? { email: searchQuery.trim() }
          : { phoneNumber: searchQuery.trim() };

      const response = await apiService.searchUser(searchData);
      setSearchResult(response.data);
    } catch (error: unknown) {
      const errorMsg =
        error && typeof error === "object" && "response" in error
          ? (error as ApiError).response?.data?.message || "User not found"
          : "User not found";
      setError(errorMsg);
    } finally {
      setIsSearching(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    setBlockingUserId(userId);
    try {
      const blockUntil = new Date();
      blockUntil.setDate(blockUntil.getDate() + parseInt(blockDuration));

      await apiService.blockUser({
        userId,
        blockUntil: blockUntil.toISOString(),
      });

      // Refresh blocked users list
      await loadBlockedUsers();

      // Clear search result if it was the blocked user
      if (searchResult?.id === userId) {
        setSearchResult(null);
        setSearchQuery("");
      }

      setError(null);
    } catch (error: unknown) {
      const errorMsg =
        error && typeof error === "object" && "response" in error
          ? (error as ApiError).response?.data?.message ||
            "Failed to block user"
          : "Failed to block user";
      setError(errorMsg);
    } finally {
      setBlockingUserId(null);
    }
  };

  const handleUnblockUser = async (userId: string) => {
    setBlockingUserId(userId);
    try {
      await apiService.unblockUser({ userId });

      // Refresh blocked users list
      await loadBlockedUsers();
      setError(null);
    } catch (error: unknown) {
      const errorMsg =
        error && typeof error === "object" && "response" in error
          ? (error as ApiError).response?.data?.message ||
            "Failed to unblock user"
          : "Failed to unblock user";
      setError(errorMsg);
    } finally {
      setBlockingUserId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        </div>
        <p className="text-gray-600">
          Search for users and manage blocked accounts
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search Users
        </h3>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search by {searchType === "email" ? "Email" : "Phone Number"}
              </label>
              {searchType === "phone" && (
                <p className="text-xs text-gray-500 mb-2">
                  Enter exactly 10 digits (e.g., 0123456789)
                </p>
              )}
              <input
                type={searchType === "email" ? "email" : "tel"}
                id="search"
                value={searchQuery}
                onChange={(e) => {
                  let value = e.target.value;
                  // For phone numbers, only allow digits and limit to 10 characters
                  if (searchType === "phone") {
                    value = value.replace(/\D/g, "").slice(0, 10);
                  }
                  setSearchQuery(value);
                }}
                placeholder={
                  searchType === "email"
                    ? "Enter email address..."
                    : "Enter 10-digit phone number..."
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isSearching}
                maxLength={searchType === "phone" ? 10 : undefined}
              />
            </div>

            <div className="w-40">
              <label
                htmlFor="searchType"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Type
              </label>
              <select
                id="searchType"
                value={searchType}
                onChange={(e) =>
                  setSearchType(e.target.value as "email" | "phone")
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={isSearching}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSearching || !searchQuery.trim()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {isSearching ? "Searching..." : "Search User"}
          </button>
        </form>

        {/* Search Result */}
        {searchResult && (
          <div className="mt-6 p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Search Result</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {searchResult.userInfo?.profilePictureUrl ? (
                    <img
                      src={searchResult.userInfo.profilePictureUrl}
                      alt={
                        searchResult.userInfo?.fullName || searchResult.email
                      }
                      className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {searchResult.userInfo?.fullName || searchResult.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      {searchResult.email}
                    </p>
                    {searchResult.phoneNumber && (
                      <p className="text-sm text-gray-600">
                        {searchResult.phoneNumber}
                      </p>
                    )}
                    {searchResult.userInfo?.bio && (
                      <p className="text-xs text-gray-500 truncate max-w-48">
                        {searchResult.userInfo.bio}
                      </p>
                    )}
                  </div>
                </div>

                {searchResult.blockDate &&
                new Date(searchResult.blockDate) > new Date() ? (
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Ban className="w-3 h-3" />
                      Blocked
                    </span>
                    <button
                      onClick={() => handleUnblockUser(searchResult.id)}
                      disabled={blockingUserId === searchResult.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-1"
                    >
                      <ShieldOff className="w-4 h-4" />
                      Unblock
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <select
                      value={blockDuration}
                      onChange={(e) => setBlockDuration(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      aria-label="Select block duration"
                    >
                      <option value="1">1 Day</option>
                      <option value="3">3 Days</option>
                      <option value="7">1 Week</option>
                      <option value="30">1 Month</option>
                    </select>
                    <button
                      onClick={() => handleBlockUser(searchResult.id)}
                      disabled={blockingUserId === searchResult.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center gap-1"
                    >
                      <Shield className="w-4 h-4" />
                      Block User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Blocked Users Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Ban className="w-5 h-5" />
            Blocked Users
          </h3>
          <button
            onClick={loadBlockedUsers}
            disabled={isLoadingBlocked}
            className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1"
          >
            Refresh
          </button>
        </div>

        {isLoadingBlocked ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        ) : blockedUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Ban className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No blocked users found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="p-5 border border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {user.userInfo?.profilePictureUrl ? (
                      <div className="relative">
                        <img
                          src={user.userInfo.profilePictureUrl}
                          alt={user.userInfo?.fullName || user.email}
                          className="w-14 h-14 rounded-full object-cover border-3 border-red-200 shadow-md"
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <Ban className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center border-3 border-red-200 shadow-md">
                          <Users className="w-7 h-7 text-red-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <Ban className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-lg">
                          {user.userInfo?.fullName || user.email}
                        </p>
                        {user.role === "ADMIN" && (
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                      {user.phoneNumber && (
                        <p className="text-sm text-gray-600 mb-2">
                          {user.phoneNumber}
                        </p>
                      )}
                      <div className="flex flex-col gap-1">
                        {user.blockDate && (
                          <p className="text-xs text-red-700 font-medium">
                            🚫 Blocked since: {formatDate(user.blockDate)}
                          </p>
                        )}
                        {user.createdAt && (
                          <p className="text-xs text-gray-500">
                            👤 Member since: {formatDate(user.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnblockUser(user.id)}
                    disabled={blockingUserId === user.id}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-1"
                  >
                    <ShieldOff className="w-4 h-4" />
                    {blockingUserId === user.id ? "Unblocking..." : "Unblock"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementSection;
