import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type Profile = {
	id: string;
	username: string | null;
	avatar_url: string | null;
	xp: number;
	level: number;
	kind_gems: number;
	timezone: string;
	country: string | null;
};

type AuthState = {
	session: Session | null;
	profile: Profile | null;
	loading: boolean;
	setSession: (session: Session | null) => void;
	setProfile: (profile: Profile | null) => void;
	fetchProfile: (userId: string) => Promise<void>;
	signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
	session: null,
	profile: null,
	loading: true,

	setSession: (session) => set({ session, loading: false }),
	setProfile: (profile) => set({ profile }),

	fetchProfile: async (userId: string) => {
		const { data } = await supabase
			.from("profiles")
			.select("*")
			.eq("id", userId)
			.single();
		if (data) set({ profile: data });
	},

	signOut: async () => {
		await supabase.auth.signOut();
		set({ session: null, profile: null });
	},
}));
