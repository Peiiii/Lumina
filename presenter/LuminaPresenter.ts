import { AppManager } from '../managers/AppManager';
import { FragmentsManager } from '../managers/FragmentsManager';
import { AiManager } from '../managers/AiManager';

export class LuminaPresenter {
  app = new AppManager();
  fragments = new FragmentsManager();
  ai = new AiManager();

  constructor() {
    this.fragments.init();
  }
}

export const presenter = new LuminaPresenter();