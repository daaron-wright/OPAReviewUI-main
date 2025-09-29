/**
 * File system adapter for loading JSON data
 */

import { StateMachine } from '@/domain/state-machine/types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Loads state machine data from a JSON file
 * @param fileName - Name of the JSON file in the data directory
 * @returns Parsed state machine data
 * @throws Error if file cannot be read or parsed
 */
export async function loadStateMachineFromFile(
  fileName: string
): Promise<StateMachine> {
  const filePath = path.join(process.cwd(), 'data', fileName);
  
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    if (!data.stateMachine) {
      throw new Error('Invalid state machine format: missing stateMachine property');
    }
    
    return data.stateMachine as StateMachine;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to load state machine: ${error.message}`);
    }
    throw new Error('Failed to load state machine: Unknown error');
  }
}

/**
 * Lists available state machine files in the data directory
 * @returns Array of available JSON file names
 */
export async function listAvailableStateMachines(): Promise<string[]> {
  const dataDir = path.join(process.cwd(), 'data');
  
  try {
    const files = await fs.readdir(dataDir);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    console.error('Failed to list state machine files:', error);
    return [];
  }
}
