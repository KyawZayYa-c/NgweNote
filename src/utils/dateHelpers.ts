import { format, isToday, isYesterday } from 'date-fns';

export const formatDateHeader = (date: Date): string => {
  if (isToday(date)) return 'ယနေ့';
  if (isYesterday(date)) return 'မနေ့က';
  
  const myanmarMonths = [
    'ဇန်နဝါရီ', 'ဖေဖော်ဝါရီ', 'မတ်လ', 'ဧပြီ', 'မေလ', 'ဇွန်လ',
    'ဇူလိုင်', 'သြဂုတ်', 'စက်တင်ဘာ', 'အောက်တိုဘာ', 'နိုဝင်ဘာ', 'ဒီဇင်ဘာ'
  ];

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${myanmarMonths[monthIndex]} ${day}၊ ${year}`;
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatFullDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd HH:mm');
};
