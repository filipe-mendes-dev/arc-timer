import { Redirect } from 'expo-router';

const GymHistoryIndexRoute = () => (
    <Redirect href={{ pathname: '/history', params: { kind: 'gym' } }} />
);

export default GymHistoryIndexRoute;
