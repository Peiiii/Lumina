import { create } from 'zustand';
import { Fragment } from '../types';

interface FragmentsState {
  fragments: Fragment[];
}

export const useFragmentsStore = create<FragmentsState>(() => ({
  fragments: [],
}));