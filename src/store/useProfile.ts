import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Profile = {
  name: string;
  avatar: string | null;
  birthDate: string;
  birthTime: string;
  province: string;
  country: string;
  onboarded: boolean;
  premiumTrialStartedAt: string | null;
  points: number;
  streak: number;
  lastCheckIn: string | null;
};

type State = Profile & {
  setProfile: (p: Partial<Profile>) => void;
  checkIn: () => number | null;
  startTrial: () => void;
  reset: () => void;
};

const initial: Profile = {
  name: "ผู้เดินทางแห่งดวงดาว",
  avatar: null,
  birthDate: "",
  birthTime: "",
  province: "กรุงเทพมหานคร",
  country: "ประเทศไทย",
  onboarded: false,
  premiumTrialStartedAt: null,
  points: 120,
  streak: 0,
  lastCheckIn: null,
};

export const useProfile = create<State>()(
  persist(
    (set, get) => ({
      ...initial,
      setProfile: (p) => set(p),
      checkIn: () => {
        const today = new Date().toDateString();
        if (get().lastCheckIn === today) return null;
        const reward = 20 + Math.floor(Math.random() * 30);
        set({
          lastCheckIn: today,
          points: get().points + reward,
          streak: get().streak + 1,
        });
        return reward;
      },
      startTrial: () => set({ premiumTrialStartedAt: new Date().toISOString() }),
      reset: () => set(initial),
    }),
    { name: "horathai-profile" },
  ),
);

export function seedKey(p: Profile) {
  return `${p.birthDate}|${p.birthTime}|${p.province}`;
}

export function trialDaysLeft(startedAt: string | null) {
  if (!startedAt) return null;
  const elapsed = (Date.now() - new Date(startedAt).getTime()) / 86400000;
  return Math.max(0, Math.ceil(30 - elapsed));
}