import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Calendar, Clock, ChevronRight, Filter } from 'lucide-react-native';
import apiClient from '../api/client';
import { ApiResponse, RechargeHistory } from '../types/api';

const HistoryScreen = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await apiClient.get<ApiResponse<RechargeHistory>>('?action=recharge_history');
      if (response.data.success) {
        setRecords(response.data.data.records);
      }
    } catch (error) {
      console.error('Failed to fetch history', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordMain}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subText}>{item.package_name} • ₹{item.package_amount}</Text>
        </View>
        <Text style={styles.date}>{item.recharge_date_fmt}</Text>
      </View>

      <View style={styles.recordFooter}>
        <View style={styles.tag}>
          <Clock size={12} color="#64748B" />
          <Text style={styles.tagText}>{item.validity_days} Days</Text>
        </View>
        <View style={styles.tag}>
          <Calendar size={12} color="#64748B" />
          <Text style={styles.tagText}>Next: {item.next_recharge_fmt}</Text>
        </View>
        <TouchableOpacity style={styles.detailsBtn}>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recharge History</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchHistory();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No history records found</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  filterBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recordMain: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  subText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  detailsBtn: {
    marginLeft: 'auto',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
  },
});

export default HistoryScreen;
