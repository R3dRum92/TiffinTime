// Add this to a new file: hooks/useUserDetails.ts
import { useQuery } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserDetailsResponse {
  id: string;
  name: string;
  phone_number: string;
  email: string;
}

// Fetch a specific user's details by user_id
export const useUserDetails = (userId: string | null) => {
  return useQuery({
    queryKey: ['userDetails', userId],
    queryFn: async (): Promise<UserDetailsResponse> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch multiple users' details at once
export const useBatchUserDetails = (userIds: string[]) => {
  return useQuery({
    queryKey: ['batchUserDetails', userIds.sort().join(',')],
    queryFn: async (): Promise<Record<string, UserDetailsResponse>> => {
      if (!userIds || userIds.length === 0) {
        return {};
      }

      // Fetch all users in parallel
      const promises = userIds.map(async (userId) => {
        try {
          const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            return { userId, data: null };
          }

          const data = await response.json();
          return { userId, data };
        } catch (error) {
          return { userId, data: null };
        }
      });

      const results = await Promise.all(promises);
      
      // Convert array to object keyed by userId
      const userDetailsMap: Record<string, UserDetailsResponse> = {};
      results.forEach(({ userId, data }) => {
        if (data) {
          userDetailsMap[userId] = data;
        }
      });

      return userDetailsMap;
    },
    enabled: userIds && userIds.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};