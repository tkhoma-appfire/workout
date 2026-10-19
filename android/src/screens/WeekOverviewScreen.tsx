import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import WeeklyDashboardHeader from '../components/WeeklyDashboardHeader';

export default function WeekOverviewScreen(): React.JSX.Element {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <WeeklyDashboardHeader />
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
