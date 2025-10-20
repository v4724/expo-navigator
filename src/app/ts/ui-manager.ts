/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
  state: UIState,
) {
  const stallId = stallElement.dataset['stallId'];
  if (!stallId) return;

  // Delegate to magnifier controller which handles main element + its own clone
  // On mobile, update the main element directly

  // Always update the modal mini-map clone
  const modalClone = state.stallIdToModalCloneMap.get(stallId);
  if (modalClone) {
    modalClone.classList.toggle(className, force);
  }
}
