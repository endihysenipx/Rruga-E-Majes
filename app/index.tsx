import { Redirect } from 'expo-router';

import { ErrorState, LoadingState } from '@/components/ui/States';
import { useGameStore } from '@/store/useGameStore';

export default function EntryScreen() {
  const status = useGameStore((state) => state.bootstrapStatus);
  const onboardingComplete = useGameStore((state) => state.onboardingComplete);
  const retry = useGameStore((state) => state.retryBootstrap);
  if (status === 'error') return <ErrorState messageKey="errors.database" onRetry={() => void retry()} />;
  if (status !== 'ready') return <LoadingState />;
  return <Redirect href={onboardingComplete ? '/(tabs)' : '/onboarding'} />;
}
