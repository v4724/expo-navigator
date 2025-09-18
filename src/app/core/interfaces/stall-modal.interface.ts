import { DOMElements } from 'src/app/ts/dom-elements';
import { MagnifierController } from 'src/app/ts/magnifier';
import { UIState } from 'src/app/ts/ui-manager';
import { StallDto } from './stall-dto.interface';

/** A context object to pass dependencies into modal functions. */
export interface ModalContext {
  allStalls: StallDto[];
  elements: DOMElements;
  magnifierController: MagnifierController | null;
  uiState: UIState;
  isMobile: boolean;
}
