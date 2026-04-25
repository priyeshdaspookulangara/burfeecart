export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface Admin {
  id: number;
  username: string;
  name: string;
}

export interface LoginData {
  token: string;
  expires_in: number;
  admin: Admin;
  message: string;
}

export interface DashboardData {
  date: string;
  section: {
    members: {
      total: number;
      today: number;
      month: number;
      active: number;
    };
    business: {
      total: number;
      today: number;
      month: number;
      repurchase: number;
      repurchase_today: number;
    };
    commissions: {
      total: number;
      today: number;
      pending_payouts: number;
      pending_count: number;
      paid_out: number;
      by_level: Array<{ level: number; amount: number }>;
    };
    epins: {
      total: number;
      active: number;
      used: number;
    };
    recharges: {
      total_records: number;
      today: number;
      upcoming_5days: number;
      overdue: number;
    };
  };
  charts: {
    labels: string[];
    registrations: number[];
    business: number[];
    recharges: number[];
  };
  recent_registrations: Array<{
    name: string;
    member_id: string;
    mobile: string;
    package: string;
    joining_amount: number;
    joined_date: string;
  }>;
  pending_payouts: Array<Payout>;
  recent_payouts: Array<Payout>;
}

export interface Payout {
  id: number;
  member_name: string;
  member_id: string;
  bank_name: string;
  account_no: string;
  amount: number;
  payout_date: string;
  status: string;
}

export interface RechargeMember {
  member_id: string;
  name: string;
  mobile: string;
  carrier: string;
  package_amount: number;
  package_name: string;
  last_recharge?: string;
  last_recharge_fmt?: string;
  next_recharge: string;
  next_recharge_fmt: string;
  validity_days?: number;
  status: {
    label: string;
    days_diff: number;
    color: string;
  };
  urgency?: {
    urgency: string;
    seconds_diff: number;
    minutes_diff: number;
    hours_diff: number;
    days_diff: number;
    label: string;
    color: string;
    badge: string;
  };
  days_remaining?: number;
  days_overdue?: number;
}

export interface RechargeList {
  count: number;
  members: RechargeMember[];
}

export interface RechargeHistory {
  total: number;
  limit: number;
  offset: number;
  records: Array<RechargeMember & { id: number; recorded_at: string }>;
}

export interface RechargeAlerts {
  generated_at: string;
  current_time: string;
  seconds_to_midnight: number;
  minutes_to_midnight: number;
  summary: {
    due_just_now: number;
    due_next_hour: number;
    due_today: number;
    due_tomorrow: number;
    due_in_5_days: number;
    overdue: number;
    total_alerts: number;
  };
  buckets: {
    due_just_now: RechargeMember[];
    due_next_hour: RechargeMember[];
    due_today: RechargeMember[];
    due_tomorrow: RechargeMember[];
    due_in_5_days: RechargeMember[];
    overdue: RechargeMember[];
  };
}
