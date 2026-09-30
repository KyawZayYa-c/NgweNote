import React from 'react';
import { View, Text } from 'react-native';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { format } from 'date-fns';
import { TransactionItem } from './TransactionItem';
import { styles } from './styles';

interface MonthGroupProps {
  monthGroup: any;
  index: number;
  totalMonths: number;
  onLongPressItem: (item: any) => void;
  theme: string;
  themeColors: any;
}

export const MonthGroup: React.FC<MonthGroupProps> = ({
  monthGroup,
  index,
  totalMonths,
  onLongPressItem,
  theme,
  themeColors,
}) => {
  return (
    <View>
      <View style={styles.monthDivider}>
        <Text style={styles.monthText}>{monthGroup.monthTitle}</Text>
        <View style={styles.monthTotalBox}>
          <Text style={styles.monthInText}>
            +{monthGroup.monthIn.toLocaleString()}
          </Text>
          <Text style={styles.monthOutText}>
            -{monthGroup.monthOut.toLocaleString()}
          </Text>
        </View>
      </View>

      {monthGroup.days.map((dayGroup: any) => (
        <View key={dayGroup.date} style={styles.dateBlock}>
          <View style={styles.dateHeader}>
            <View style={styles.dateLeft}>
              <CalendarIcon size={14} color="#888" />
              <Text style={styles.dateTitle}>
                {format(new Date(dayGroup.date), 'MMMM dd, yyyy')}
              </Text>
            </View>
            <View style={styles.dateRight}>
              {dayGroup.dayIn > 0 && (
                <Text style={styles.dayIn}>
                  +{dayGroup.dayIn.toLocaleString()}
                </Text>
              )}
              {dayGroup.dayOut > 0 && (
                <Text style={styles.dayOut}>
                  -{dayGroup.dayOut.toLocaleString()}
                </Text>
              )}
            </View>
          </View>

          {dayGroup.data.map((tData: any) => (
            <TransactionItem
              key={tData.id}
              data={tData}
              onLongPress={onLongPressItem}
              themeColors={themeColors}
            />
          ))}
        </View>
      ))}

      {index < totalMonths - 1 && (
        <View
          style={[
            styles.monthSeparator,
            {
              backgroundColor:
                theme === 'dark'
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        />
      )}
    </View>
  );
};