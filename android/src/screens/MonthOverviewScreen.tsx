import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import MonthlyDashboardHeader from '../components/MonthlyDashboardHeader';

export default function MonthOverviewScreen(): React.JSX.Element {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <MonthlyDashboardHeader />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
});
