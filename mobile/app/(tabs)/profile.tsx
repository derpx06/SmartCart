import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
  const { name, userId, email, role, phone, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={26} color="#1C1B1F" />
          </View>
          <ThemedText style={styles.title}>Profile</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your Williams Sonoma account</ThemedText>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <ThemedText style={styles.label}>Name</ThemedText>
            <ThemedText style={styles.value}>{name || 'Guest'}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <ThemedText style={styles.value}>{email || 'Not available'}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Role</ThemedText>
            <ThemedText style={styles.value}>{role || 'Customer'}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Phone</ThemedText>
            <ThemedText style={styles.value}>{phone || 'Not available'}</ThemedText>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText style={styles.label}>Customer ID</ThemedText>
            <ThemedText style={styles.value}>{userId || 'Not available'}</ThemedText>
          </View>
        </View>

        <Pressable style={styles.logoutButton} onPress={() => void logout()}>
          <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
          <ThemedText style={styles.logoutText}>Log out</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  header: { marginBottom: 20 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EFEFED',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700' },
  subtitle: { marginTop: 6, fontSize: 14, color: 'rgba(28,27,31,0.68)' },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(28,27,31,0.14)',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: { paddingVertical: 12 },
  label: { fontSize: 12, color: 'rgba(28,27,31,0.58)' },
  value: { marginTop: 4, fontSize: 15, fontWeight: '600' },
  divider: { height: 1, backgroundColor: 'rgba(28,27,31,0.10)' },
  logoutButton: {
    marginTop: 18,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#1C1B1F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});
