import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SearchBar } from '@nurse/Search/component/SearchBar';
import { SearchResults } from '@nurse/Search/component/SearchResults';
import { SortModal } from '@nurse/Search/component/SortModal';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortBy, setSortBy] = useState('Best matches');

  return (
    <View style={styles.container}>
      <SearchBar
        query={query}
        setQuery={setQuery}
        onFilterPress={() => setShowFilters(!showFilters)}
        isSortActive={showFilters}
      />

      <View style={styles.content}>
        {/* Search Results Filter Header */}
        {showFilters && (
          <TouchableOpacity
            style={styles.sortTrigger}
            onPress={() => setSortModalVisible(true)}
          >
            <MaterialIcon name="swap-vert" size={18} color="#999696" />
            <Text style={styles.sortLabel}>{sortBy}</Text>
            <Icon name="chevron-down" size={16} color="#999696" />
          </TouchableOpacity>
        )}

        <Text style={styles.resultsTitle}>Results</Text>

        <SearchResults data={[]} />
      </View>

      {/* The Sort Modal */}
      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        selectedOption={sortBy}
        onSelect={setSortBy}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  content: { flex: 1 },
  resultsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B2B2B2',
    paddingBottom: 15,
    paddingTop: 15,
    fontFamily: 'AlteHaasGrotesk',
  },
  sortTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    marginBottom: 20,
    height: '6%',
  },
  sortLabel: {
    marginHorizontal: 8,
    fontSize: 13,
    fontFamily: 'AlteHaasGrotesk',
    color: '#999696',
  },
});
