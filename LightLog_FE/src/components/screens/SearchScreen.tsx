import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../../theme/theme';
import Header from '../common/Header';
import diaryService, { Diary } from '../../services/diaryService';

interface SearchScreenProps {
  onClose?: () => void;
}

interface SearchResultItemProps {
  diary: Diary;
  keyword: string;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ diary, keyword }) => {
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const highlightKeyword = (text: string, keyword: string): React.ReactNode => {
    if (!keyword) return text;
    
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, index) => (
      part.toLowerCase() === keyword.toLowerCase() ? (
        <Text key={index} style={styles.highlight}>{part}</Text>
      ) : (
        <Text key={index}>{part}</Text>
      )
    ));
  };

  const getPreviewText = (content: string, maxLength: number = 100): string => {
    return content.length > maxLength ? content.slice(0, maxLength) + '...' : content;
  };

  return (
    <TouchableOpacity style={styles.resultItem}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultDate}>{formatDate(diary.date)}</Text>
      </View>
      <Text style={styles.resultContent}>
        {highlightKeyword(getPreviewText(diary.content), keyword)}
      </Text>
    </TouchableOpacity>
  );
};

const SearchScreen: React.FC<SearchScreenProps> = ({ onClose }) => {
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchResults, setSearchResults] = useState<Diary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim() && !startDate && !endDate) {
      Alert.alert('알림', '검색 키워드나 날짜 범위를 입력해주세요.');
      return;
    }

    if ((startDate && !endDate) || (!startDate && endDate)) {
      Alert.alert('알림', '시작 날짜와 종료 날짜를 모두 입력해주세요.');
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      Alert.alert('알림', '시작 날짜는 종료 날짜보다 빨라야 합니다.');
      return;
    }

    try {
      setIsSearching(true);
      const results = await diaryService.searchDiaries({
        keyword: keyword.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('검색 실패:', error);
      Alert.alert('오류', '검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setKeyword('');
    setStartDate('');
    setEndDate('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <View style={styles.container}>
      <Header 
        title="일기 검색" 
        showBackButton={!!onClose}
        onBackPress={onClose}
      />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* 검색 폼 */}
        <View style={styles.searchForm}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>키워드 검색</Text>
            <TextInput
              style={styles.textInput}
              placeholder="찾고 싶은 내용을 입력하세요"
              value={keyword}
              onChangeText={setKeyword}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>날짜 범위</Text>
            <View style={styles.dateRow}>
              <TextInput
                style={[styles.textInput, styles.dateInput]}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                keyboardType="numeric"
              />
              <Text style={styles.dateSeparator}>~</Text>
              <TextInput
                style={[styles.textInput, styles.dateInput]}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.clearButton]} 
              onPress={handleClear}
            >
              <Text style={styles.clearButtonText}>초기화</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.searchButton]} 
              onPress={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>검색</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* 검색 결과 */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            <Text style={styles.resultsTitle}>
              검색 결과 ({searchResults.length}건)
            </Text>
            
            {searchResults.length > 0 ? (
              <View style={styles.resultsList}>
                {searchResults.map((diary) => (
                  <SearchResultItem 
                    key={diary.id} 
                    diary={diary} 
                    keyword={keyword}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyResults}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
                <Text style={styles.emptySubText}>
                  다른 키워드나 날짜 범위로 검색해보세요
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  searchForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text,
    backgroundColor: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
  },
  dateSeparator: {
    marginHorizontal: 12,
    fontSize: 16,
    color: theme.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  clearButtonText: {
    color: theme.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: theme.main,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsSection: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 16,
  },
  resultsList: {
    gap: 12,
  },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resultHeader: {
    marginBottom: 8,
  },
  resultDate: {
    fontSize: 14,
    color: theme.main,
    fontWeight: '600',
  },
  resultContent: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  highlight: {
    backgroundColor: '#fff3cd',
    color: '#856404',
    fontWeight: '600',
  },
  emptyResults: {
    alignItems: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: theme.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: theme.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 100,
  },
});

export default SearchScreen;