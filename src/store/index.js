import { create } from 'mobx-persist';
import appStore from './app-store';
import monitoringStore from './monitoring-store';
import contentTypesStore from './content-types-store'
import completeWaresStore from './complete-wares-store';

export const hydrate = create({
  storage: localStorage,
  jsonify: true
});

const hydratedStore = {
  appStore,
}

const store = {
  monitoringStore,
  contentTypesStore,
  completeWaresStore,
  ...hydratedStore
}

const promissess = Object.entries(hydratedStore).map(([name, _store]) => hydrate(name, _store));
export const loadFromStorage = () => Promise.all(promissess);

export default store;
