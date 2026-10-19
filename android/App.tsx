import React, {useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import AppTabBar, {type AppTab} from './src/components/AppTabBar';
import FavoritesScreen from './src/screens/FavoritesScreen';
import MonthOverviewScreen from './src/screens/MonthOverviewScreen';
import WeekOverviewScreen from './src/screens/WeekOverviewScreen';
import {colors} from './src/theme';

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<AppTab>('month');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor={colors.screen} />
        <View style={styles.body}>
          {activeTab === 'week' ? (
            <WeekOverviewScreen />
          ) : activeTab === 'month' ? (
            <MonthOverviewScreen />
          ) : (
            <FavoritesScreen />
          )}
        </View>
        <AppTabBar activeTab={activeTab} onChange={setActiveTab} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screen,
  },
  body: {
    flex: 1,
  },
});

export default App;
