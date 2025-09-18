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
 * Renders all stall areas onto the map and creates clones for the magnifiers.
 * @param allStalls The list of all processed stalls.
 * @param elements A reference to all DOM elements.
 * @param magnifierController The controller for the desktop magnifier.
 * @param state The shared UI state object.
 */
export function renderStalls(
  allStalls: StallData[],
  elements: DOMElements,
  magnifierController: MagnifierController | null,
  state: UIState
) {
  // This set contains rows that are *permanently* grouped on all screen sizes.
  const permanentlyGroupedRowIds = new Set(
    stallGridRefs.filter((r) => r.isGrouped).map((r) => r.groupId)
  );

  // --- 1. Render all individual stall elements ---
  // They are created for logic, cloning, and desktop view. CSS will manage visibility.
  allStalls.forEach((stall) => {
    if (!stall.coords) return;

    const area = document.createElement('div');
    area.className = 'stall-area';
    if (stall.promoData.length > 0) {
      area.classList.add('has-promo');
    }

    // Stalls that are members of a permanently grouped row are hidden on the main map (on all screen sizes).
    const rowId = stall.id.substring(0, 1);
    if (permanentlyGroupedRowIds.has(rowId)) {
      area.classList.add('is-grouped-member');
    }

    area.dataset['stallId'] = stall.id;
    area.style.top = stall.coords.top;
    area.style.left = stall.coords.left;
    area.style.width = stall.coords.width;
    area.style.height = stall.coords.height;
    area.setAttribute('aria-label', `Stall: ${stall.stallTitle}`);
    if (stall.num) {
      area.textContent = stall.num.toString().padStart(2, '0');
    }

    elements.mapContainer.appendChild(area);
    magnifierController?.addStall(area);

    const modalClone = area.cloneNode(true) as HTMLElement;
    elements.modalMagnifierStallLayer.appendChild(modalClone);
    state.stallIdToModalCloneMap.set(stall.id, modalClone);
  });

  // --- 2. Create the visible, clickable group areas for ALL rows ---
  // Their visibility will be controlled by CSS based on screen size and whether they are permanently grouped.
  stallGridRefs.forEach((row) => {
    const groupArea = document.createElement('div');
    // Add both classes. `.stall-area` for base styles, `.stall-group-area` for group-specific styles.
    groupArea.className = 'stall-area stall-group-area';
    groupArea.dataset['rowId'] = row.groupId;
    groupArea.style.top = `${row.boundingBox.top}%`;
    groupArea.style.left = `${row.boundingBox.left}%`;
    groupArea.style.width = `${row.boundingBox.right - row.boundingBox.left}%`;
    groupArea.style.height = `${row.boundingBox.bottom - row.boundingBox.top}%`;
    groupArea.setAttribute('aria-label', `Row: ${row.groupId}`);
    groupArea.textContent = row.groupId;

    // If a row is NOT permanently grouped, its group area should be hidden by default on desktop.
    // CSS will make it visible on mobile devices.
    if (!row.isGrouped) {
      groupArea.classList.add('mobile-only-group');
    }

    elements.mapContainer.appendChild(groupArea);

    // For permanently grouped rows, ensure their group area is cloned into both
    // the main magnifier and the modal mini-map for visual consistency.
    if (row.isGrouped) {
      // Add to main magnifier
      magnifierController?.addGroupArea(groupArea);

      // Add to modal mini-map
      const modalGroupClone = groupArea.cloneNode(true) as HTMLElement;
      elements.modalMagnifierStallLayer.appendChild(modalGroupClone);
      state.rowIdToModalGroupCloneMap.set(row.groupId, modalGroupClone);
    }
  });
}

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
