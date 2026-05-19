import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import "react-native-url-polyfill/auto";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const ExpoSecureStoreAdapter = {
	getItem: (key: string) => SecureStore.getItemAsync(key),
	setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
	removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: ExpoSecureStoreAdapter,
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

export type Database = {
	public: {
		Tables: {
			profiles: {
				Row: {
					id: string;
					username: string | null;
					avatar_url: string | null;
					xp: number;
					level: number;
					timezone: string;
					country: string | null;
					created_at: string;
				};
				Insert: {
					id: string;
					username?: string | null;
					avatar_url?: string | null;
					xp?: number;
					level?: number;
					timezone?: string;
					country?: string | null;
				};
				Update: {
					username?: string | null;
					avatar_url?: string | null;
					xp?: number;
					level?: number;
					timezone?: string;
					country?: string | null;
				};
			};
			actions: {
				Row: {
					id: string;
					title: string;
					description: string;
					category: string;
					co2_equivalent: number;
					impact_unit: string;
					status: "pending" | "approved" | "published";
					publish_date: string | null;
					created_at: string;
				};
			};
			completions: {
				Row: {
					id: string;
					user_id: string;
					action_id: string;
					completed_at: string;
					streak_day: number;
				};
			};
			streaks: {
				Row: {
					user_id: string;
					current_streak: number;
					longest_streak: number;
					last_completion_date: string | null;
				};
			};
			badges: {
				Row: {
					id: string;
					name: string;
					description: string;
					category: string;
					image_url: string | null;
					condition_type: string;
					condition_value: number;
				};
			};
			user_badges: {
				Row: {
					id: string;
					user_id: string;
					badge_id: string;
					earned_at: string;
				};
			};
			friendships: {
				Row: {
					id: string;
					follower_id: string;
					following_id: string;
					created_at: string;
				};
			};
			groups: {
				Row: {
					id: string;
					name: string;
					type: "school" | "company";
					country: string | null;
					admin_user_id: string;
					created_at: string;
				};
			};
			group_members: {
				Row: {
					id: string;
					group_id: string;
					user_id: string;
					status: "pending" | "approved";
					joined_at: string | null;
				};
			};
			impact_reports: {
				Row: {
					id: string;
					action_id: string;
					date: string;
					total_completions: number;
					co2_saved_kg: number;
					generated_image_url: string | null;
					created_at: string;
				};
			};
			push_tokens: {
				Row: {
					id: string;
					user_id: string;
					expo_push_token: string;
					created_at: string;
				};
			};
		};
	};
};
