/**
 * Main page component - Entry point for the state machine visualizer
 */

import { StateMachineViewer } from '@/components/state-machine-viewer';
import { StartupNotification } from '@/components/startup-notification';

export default function HomePage(): JSX.Element {
  return (
    <>
      <StartupNotification />
      <StateMachineViewer />
    </>
  );
}
