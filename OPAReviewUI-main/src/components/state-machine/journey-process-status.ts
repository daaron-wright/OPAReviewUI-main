export type JourneyProcessStepStatus = 'idle' | 'active' | 'complete' | 'error';

export interface JourneyProcessStep {
  readonly id: string;
  readonly label: string;
  readonly status: JourneyProcessStepStatus;
  readonly description?: string;
}
