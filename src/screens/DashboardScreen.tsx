import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import {
  Users,
  Briefcase,
  Percent,
  Smartphone,
  CreditCard,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react-native';
import apiClient from '../api/client';
import { ApiResponse, DashboardData } from '../types/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  const fetchDashboard = async () => {
    try {
      const response = await apiClient.get<ApiResponse<DashboardData>>('?action=dashboard');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const handlePayoutAction = async (id: number, status: string) => {
    try {
      const response = await apiClient.post<ApiResponse<any>>('?action=payout_action', { id, status });
      if (response.data.success) {
        Alert.alert('Success', response.data.data.message);
        fetchDashboard();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update payout');
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subValue && <Text style={styles.statSubValue}>{subValue}</Text>}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.dateText}>{data?.date}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <TrendingUp size={20} color="#64748B" />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Members"
          value={data?.section.members.total}
          subValue={`${data?.section.members.active} Active`}
          icon={Users}
          color="#4F46E5"
        />
        <StatCard
          title="Business"
          value={`₹${data?.section.business.total.toLocaleString()}`}
          subValue={`Today: ₹${data?.section.business.today}`}
          icon={Briefcase}
          color="#10B981"
        />
        <StatCard
          title="Commissions"
          value={`₹${data?.section.commissions.total.toLocaleString()}`}
          subValue={`${data?.section.commissions.pending_count} Pending`}
          icon={Percent}
          color="#F59E0B"
        />
        <StatCard
          title="Recharges"
          value={data?.section.recharges.total_records}
          subValue={`${data?.section.recharges.upcoming_5days} Upcoming`}
          icon={Smartphone}
          color="#EC4899"
        />
      </View>

      {data?.charts && (
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Performance Trend</Text>
          <LineChart
            data={{
              labels: data.charts.labels.filter((_, i) => i % 3 === 0),
              datasets: [
                {
                  data: data.charts.registrations,
                  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
                  strokeWidth: 2
                }
              ]
            }}
            width={width - 32}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '4', strokeWidth: '2', stroke: '#4F46E5' }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Registrations</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        {data?.recent_registrations.map((reg, index) => (
          <View key={index} style={styles.listItem}>
            <View style={styles.listIconContainer}>
              <UserPlaceholder name={reg.name} />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listName}>{reg.name}</Text>
              <Text style={styles.listSub}>{reg.package} • ID: {reg.member_id}</Text>
            </View>
            <View style={styles.listRight}>
              <Text style={styles.listAmount}>₹{reg.joining_amount}</Text>
              <Text style={styles.listDate}>{reg.joined_date}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.listSection, { marginBottom: 40 }]}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pending Payouts</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>Process All</Text>
          </TouchableOpacity>
        </View>
        {data?.pending_payouts.map((payout, index) => (
          <View key={index} style={styles.listItem}>
            <View style={[styles.listIconContainer, { backgroundColor: '#FEE2E2' }]}>
              <CreditCard size={20} color="#EF4444" />
            </View>
            <View style={styles.listContent}>
              <Text style={styles.listName}>{payout.member_name}</Text>
              <Text style={styles.listSub}>{payout.bank_name || 'No Bank Info'}</Text>
            </View>
            <View style={styles.listRight}>
              <Text style={styles.listAmountText}>₹{payout.amount}</Text>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => {
                  Alert.alert(
                    'Payout Action',
                    `Action for ${payout.member_name} (₹${payout.amount})`,
                    [
                      { text: 'Approve', onPress: () => handlePayoutAction(payout.id, 'approve') },
                      { text: 'Mark Paid', onPress: () => handlePayoutAction(payout.id, 'mark_paid') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <ChevronRight size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const UserPlaceholder = ({ name }: { name: string }) => {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{initials}</Text>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: (width - 48) / 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statInfo: {
    gap: 2,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  statSubValue: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chartSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  listSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  listIconContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  listSub: {
    fontSize: 12,
    color: '#64748B',
  },
  listRight: {
    alignItems: 'flex-end',
  },
  listAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#10B981',
  },
  listAmountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  listDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
  actionBtn: {
    marginTop: 4,
  }
});

export default DashboardScreen;
