/**
 * Main page component - Entry point for the state machine visualizer
 */

import { StateMachineViewer } from '@/components/state-machine-viewer';
import { loadStateMachineFromFile } from '@/adapters/file-system/json-loader';
import { processStateMachine } from '@/domain/state-machine/processor';

/**
 * Server component that loads and processes the state machine data
 */
interface HomePageProps {
  readonly searchParams?: Record<string, string | string[] | undefined>;
}

export default async function HomePage({ searchParams }: HomePageProps = {}): Promise<JSX.Element> {
  const fileMap: Record<string, string> = {
    'policy-review': 'policy_review_state_machine.json',
    'real-beneficiary': 'real_beneficiary_state_machine.json',
  };
  const defaultKey = 'policy-review';
  const requestedKeyRaw = searchParams?.machine;
  const requestedKey = Array.isArray(requestedKeyRaw) ? requestedKeyRaw[0] : requestedKeyRaw;
  const selectedKey = requestedKey && fileMap[requestedKey] ? requestedKey : defaultKey;

  try {
    // Load state machine from JSON file
    const stateMachine = await loadStateMachineFromFile(
      fileMap[selectedKey]
    );

    // Process into graph-renderable format
    const processedStateMachine = processStateMachine(stateMachine);

    return <StateMachineViewer
      stateMachine={processedStateMachine}
      rawStates={stateMachine.states}
    />;
  } catch (error) {
    return <ErrorDisplay error={error} />;
  }
}

/**
 * Error display component for load failures
 */
function ErrorDisplay({ error }: { error: unknown }): JSX.Element {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'An unexpected error occurred';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md p-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="flex items-center mb-4">
          <svg
            className="w-8 h-8 text-red-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Failed to Load State Machine
          </h1>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {errorMessage}
        </p>
        
        <button
          onClick={(): void => window.location.reload()}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
