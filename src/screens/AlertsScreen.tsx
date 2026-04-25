import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Bell, AlertTriangle, Clock, AlertCircle, Calendar, ChevronRight } from 'lucide-react-native';
import apiClient from '../api/client';
import { ApiResponse, RechargeAlerts, RechargeMember } from '../types/api';

const AlertsScreen = () => {
  const [data, setData] = useState<RechargeAlerts | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeBucket, setActiveBucket] = useState<keyof RechargeAlerts['buckets']>('due_today');

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.get<ApiResponse<RechargeAlerts>>('?action=recharge_alerts');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const BucketTab = ({ id, label, count, color, icon: Icon }: any) => (
    <TouchableOpacity
      style={[
        styles.bucketTab,
        activeBucket === id && { backgroundColor: color + '15', borderColor: color }
      ]}
      onPress={() => setActiveBucket(id)}
    >
      <View style={[styles.bucketIcon, { backgroundColor: color + '20' }]}>
        <Icon size={18} color={color} />
      </View>
      <Text style={[styles.bucketCount, { color }]}>{count}</Text>
      <Text style={[styles.bucketLabel, activeBucket === id && { color, fontWeight: 'bold' }]}>{label}</Text>
    </TouchableOpacity>
  );

  const activeMembers = data?.buckets[activeBucket] || [];

  return (
    <View style={styles.container}>
      <View style={styles.summaryGrid}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          <BucketTab
            id="overdue"
            label="Overdue"
            count={data?.summary.overdue}
            color="#DC2626"
            icon={AlertCircle}
          />
          <BucketTab
            id="due_just_now"
            label="Just Now"
            count={data?.summary.due_just_now}
            color="#7C2D12"
            icon={AlertTriangle}
          />
          <BucketTab
            id="due_next_hour"
            label="Next Hour"
            count={data?.summary.due_next_hour}
            color="#C2410C"
            icon={Clock}
          />
          <BucketTab
            id="due_today"
            label="Today"
            count={data?.summary.due_today}
            color="#EA580C"
            icon={Calendar}
          />
          <BucketTab
            id="due_tomorrow"
            label="Tomorrow"
            count={data?.summary.due_tomorrow}
            color="#D97706"
            icon={Calendar}
          />
        </ScrollView>
      </View>

      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.listTitle}>
          {activeBucket.replace(/_/g, ' ').toUpperCase()} ({activeMembers.length})
        </Text>

        {activeMembers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>No alerts in this bucket</Text>
          </View>
        ) : (
          activeMembers.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <View style={styles.memberHeader}>
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberId}>ID: {member.member_id}</Text>
                </View>
                <View style={[styles.urgencyBadge, { backgroundColor: member.urgency?.color + '20' }]}>
                  <Text style={[styles.urgencyText, { color: member.urgency?.color }]}>
                    {member.urgency?.badge} {member.urgency?.label}
                  </Text>
                </View>
              </View>
              <View style={styles.memberDetails}>
                <Text style={styles.detailText}>{member.mobile} • {member.carrier}</Text>
                <Text style={styles.detailText}>{member.package_name} (₹{member.package_amount})</Text>
              </View>
              <TouchableOpacity style={styles.actionLink}>
                <Text style={styles.actionLinkText}>Action required</Text>
                <ChevronRight size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryGrid: {
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tabsScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  bucketTab: {
    width: 100,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bucketIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  bucketCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bucketLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  listContainer: {
    flex: 1,
    padding: 20,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 16,
    letterSpacing: 1,
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  memberId: {
    fontSize: 12,
    color: '#94A3B8',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  memberDetails: {
    marginBottom: 12,
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    opacity: 0.5,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
});

export default AlertsScreen;
