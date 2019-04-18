import { create } from 'mobx-persist';
import appStore from './app-store';
import usersStore from './users-store';
import viewsStore from './views-store';

export const hydrate = create({
  storage: localStorage,
  jsonify: true
});

const hydratedStore = {
  appStore,
}

const store = {
  usersStore,
  viewsStore,
  ...hydratedStore
}

const promissess = Object.entries(hydratedStore).map(([name, _store]) => hydrate(name, _store));
export const loadFromStorage = () => Promise.all(promissess);

export default store;
