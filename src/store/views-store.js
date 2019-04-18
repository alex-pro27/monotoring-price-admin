import { observable, action, runInAction } from 'mobx';
import _ from "lodash";
import Api from '../api/api'
import View from './models/View';

class ViewsStore {

  api = new Api()
  @observable views = []
  @observable selectedView = {}

  allViews() {
    return new Promise(resolve => {
      this.api.allViews()
      .then(views => {
        runInAction(() => this.views = views.map(v => View.create(v)))
        resolve()
      })
    })
  }

  @action selectView(id) {
    return new Promise((resolve, reject) => {
      this.api.getView(id).then(
        view => {
          runInAction(() => this.selectedView = View.create(view))
          resolve()
        },
        reject
      )
    })
  }

  @action clearSelectedView() {
    this.selectedView = {}
  }

  @action clear() {

  }

}

export default new ViewsStore();