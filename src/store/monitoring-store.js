import { observable, action, runInAction } from 'mobx';
import _ from "lodash";
import Api from '../api/api'

class MonitoringStore {

  api = new Api();

  getMonitringsList(page = 1) {
    return this.api.getMonitringsList()
  }

  @action clear() {
    this.monitorings = []
  }

}

export default new MonitoringStore();