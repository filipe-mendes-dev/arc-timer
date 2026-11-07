import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
export const useAttendanceScreenStyles = createStyles(() =>
    StyleSheet.create({ content: { gap: 24 }, calendar: { gap: 8 } }),
);
