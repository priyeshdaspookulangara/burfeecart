import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Search, Filter, Smartphone, CheckCircle, Calendar, X } from 'lucide-react-native';
import apiClient from '../api/client';
import { ApiResponse, RechargeList, RechargeMember } from '../types/api';
import { format } from 'date-fns';

const RechargeListScreen = () => {
  const [members, setMembers] = useState<RechargeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<RechargeMember | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [validity, setValidity] = useState(28);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecharges = useCallback(async () => {
    try {
      const response = await apiClient.get<ApiResponse<RechargeList>>('?action=recharge_list');
      if (response.data.success) {
        setMembers(response.data.data.members);
      }
    } catch (error) {
      console.error('Failed to fetch recharges', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecharges();
  }, [fetchRecharges]);

  const handleMarkRecharge = async () => {
    if (!selectedMember) return;

    setActionLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<any>>('?action=mark_recharge', {
        member_id: selectedMember.member_id,
        recharge_date: format(new Date(), 'yyyy-MM-dd'),
        validity_days: validity,
      });

      if (response.data.success) {
        Alert.alert('Success', response.data.data.message);
        setModalVisible(false);
        fetchRecharges();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to mark recharge');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.member_id.includes(searchQuery) ||
    m.mobile.includes(searchQuery)
  );

  const renderMember = ({ item }: { item: RechargeMember }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{item.name}</Text>
          <Text style={styles.memberId}>ID: {item.member_id} • {item.carrier}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status.color + '20' }]}>
          <Text style={[styles.statusText, { color: item.status.color }]}>
            {item.status.label.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Smartphone size={16} color="#64748B" />
          <Text style={styles.infoText}>{item.mobile}</Text>
        </View>
        <View style={styles.infoRow}>
          <Calendar size={16} color="#64748B" />
          <Text style={styles.infoText}>Next: {item.next_recharge_fmt}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.packageText}>{item.package_name} (₹{item.package_amount})</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.rechargeBtn}
        onPress={() => {
          setSelectedMember(item);
          setModalVisible(true);
        }}
      >
        <CheckCircle size={18} color="#fff" />
        <Text style={styles.rechargeBtnText}>Mark Recharged</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search member, ID or mobile..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filteredMembers}
          renderItem={renderMember}
          keyExtractor={item => item.member_id}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchRecharges();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No members found</Text>
            </View>
          }
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mark Recharge</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#1E293B" />
              </TouchableOpacity>
            </View>

            <View style={styles.selectedMemberInfo}>
              <Text style={styles.modalMemberName}>{selectedMember?.name}</Text>
              <Text style={styles.modalMemberSub}>{selectedMember?.mobile} • {selectedMember?.package_name}</Text>
            </View>

            <Text style={styles.label}>Select Validity Days</Text>
            <View style={styles.validityGrid}>
              {[24, 28, 30, 56, 84].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={[styles.validityOption, validity === days && styles.validitySelected]}
                  onPress={() => setValidity(days)}
                >
                  <Text style={[styles.validityText, validity === days && styles.validityTextSelected]}>
                    {days} Days
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, actionLoading && { opacity: 0.7 }]}
              onPress={handleMarkRecharge}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm Recharge</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBarContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#1E293B',
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    padding: 16,
  },
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  memberId: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardBody: {
    gap: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
  },
  packageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rechargeBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  rechargeBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  selectedMemberInfo: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  modalMemberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalMemberSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },
  validityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  validityOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  validitySelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  validityText: {
    color: '#475569',
    fontWeight: '600',
  },
  validityTextSelected: {
    color: '#fff',
  },
  confirmBtn: {
    backgroundColor: '#4F46E5',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RechargeListScreen;
