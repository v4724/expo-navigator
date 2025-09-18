/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { stallGridRefs } from '../core/const/official-data.js';

/**
 * An interface for the controller object returned by createMagnifier.
 * This defines the public API for the main application to interact with the magnifier's state.
 */
export interface MagnifierController {
  /** Adds a stall element and its clone to the magnifier system. */
  addStall: (stallElement: HTMLElement) => void;
  /** Adds a group area element and its clone to the magnifier's stall layer. */
  addGroupArea: (groupElement: HTMLElement) => void;
  /** Updates a class on both the original stall and its clone using the stall's ID. */
  updateStallClass: (stallId: string, className: string, force: boolean) => void;
  /** Shows the magnifier. */
  show: () => void;
  /** Hides the magnifier. */
  hide: () => void;
  /** Toggles the visibility of the magnifier. */
  toggle: () => void;
  /** Returns true if the magnifier is currently visible. */
  isShown: () => boolean;
}

/**
 * Creates and manages a draggable magnifier for the map. This function encapsulates all
 * logic related to the magnifier, including its state, event handling, and synchronization
 * with the main map.
 *
 * @param mapContainer The main container for the map and stalls.
 * @param mapImage The image element of the map.
 * @param magnifierWrapper The wrapper element that is moved and positioned.
 * @param magnifier The magnifier lens element (for visuals).
 * @param magnifierStallLayer The layer inside the magnifier that holds cloned stalls.
 * @param indicators An object containing the three indicator elements.
 * @param toggleButton The button to show/hide the magnifier.
 * @param onAreaClick A callback function to execute when a stall or group area inside the magnifier is clicked.
 * @param isMobile A boolean indicating if the current device is mobile.
 * @returns A controller object to interact with the magnifier.
 */
export function createMagnifier(
  mapContainer: HTMLElement,
  mapImage: HTMLImageElement,
  magnifierWrapper: HTMLElement,
  magnifier: HTMLElement,
  magnifierStallLayer: HTMLElement,
  indicators: { prev: HTMLElement; current: HTMLElement; next: HTMLElement },
  toggleButton: HTMLElement,
  onAreaClick: (target: HTMLElement) => void,
  isMobile: boolean
): MagnifierController {
  // --- State and Configuration ---
  const zoomFactor = isMobile ? 3.5 : 2.5; // Use a higher zoom for mobile.
  const stallIdToOriginalMap = new Map<string, HTMLElement>();
  const stallIdToCloneMap = new Map<string, HTMLElement>();

  let isDragging = false;
  let isShownState = false;
  let hasBeenPositioned = false; // Flag to center the magnifier only once.
  // Variables to track drag state.
  let dragStartX = 0;
  let dragStartY = 0;
  let initialLensX = 0;
  let initialLensY = 0;
  let dragHappened = false; // Differentiates a click from a drag.
  let clickTarget: HTMLElement | null = null; // The element that was initially clicked.

  // --- Event Listeners ---
  // Listen for both mouse and touch start events on the magnifier.
  magnifierWrapper.addEventListener('mousedown', onDragStart);
  magnifierWrapper.addEventListener('touchstart', onDragStart, {
    passive: false,
  });

  // --- Controller Methods (Public API) ---
  const controller: MagnifierController = {};

  return controller;
}
