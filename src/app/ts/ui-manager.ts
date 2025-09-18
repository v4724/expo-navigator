/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { DOMElements } from './dom-elements.ts';
import type { MagnifierController } from './magnifier.ts';
import { stallGridRefs } from '../core/const/official-data.js';
import { StallData } from '../components/stall/stall-.interface.js';

/** Defines the shape of the shared UI state object. */
export interface UIState {
  selectedStallElement: HTMLElement | null;
  stallIdToModalCloneMap: Map<string, HTMLElement>;
  rowIdToModalGroupCloneMap: Map<string, HTMLElement>;
}

/** Shared state for UI elements across different modules. */
export const uiState: UIState = {
  selectedStallElement: null,
  stallIdToModalCloneMap: new Map<string, HTMLElement>(),
  rowIdToModalGroupCloneMap: new Map<string, HTMLElement>(),
};

/**
 * Updates a class on a stall element and its clones in both magnifiers.
 * @param stallElement The stall element on the main map.
 * @param className The CSS class to toggle.
 * @param force A boolean to force adding or removing the class.
 * @param magnifierController The controller for the desktop magnifier.
 * @param state The shared UI state object.
 */
export function updateStallClass(
  stallElement: HTMLElement,
  className: string,
  force: boolean,
  magnifierController: MagnifierController | null,
  state: UIState
) {
  const stallId = stallElement.dataset['stallId'];
  if (!stallId) return;

  // Delegate to magnifier controller which handles main element + its own clone
  if (magnifierController) {
    magnifierController.updateStallClass(stallId, className, force);
  } else {
    // On mobile, update the main element directly
    stallElement.classList.toggle(className, force);
  }

  // Always update the modal mini-map clone
  const modalClone = state.stallIdToModalCloneMap.get(stallId);
  if (modalClone) {
    modalClone.classList.toggle(className, force);
  }
}
