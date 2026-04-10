import React from 'react';
import { Button, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function ARBtn() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Button title="Open AR Camera" onPress={() => router.push('/ar')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
});
