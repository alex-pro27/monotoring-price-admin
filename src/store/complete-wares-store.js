import _ from 'loadsh'
import Api from '../api/api'
import { observable, action, runInAction, toJS, computed } from 'mobx';
import Paginate from './models/Paginate';

class CompleteWaresStore {

  api = new Api();
  @observable completeWares = [];
  @observable paginate = {};

  @observable monitoring_types = [];
  @observable work_groups = [];
  @observable regions = [];
  @observable monitoring_shops = [];
  @observable activeSort = {};

  @observable _filter = {
    datefrom: null,
    dateto: null,
    order_by: null,
    keywords: "",
    regions: [],
    work_groups: [],
    monitoring_shops: [],
    monitoring_types: [],
  };

  _oldFilter = {}

  get filter() {
    return toJS(this._filter)
  }

  get isCheckedFilter() {
    for (let [k, v] of Object.entries(this.filter)) {
      if (Array.isArray(v)) {
        if (v.length) {
          return true
        }
      } else if (v && !~['order_by', 'keywords'].indexOf(k)) {
        return true
      }
    }
    return false;
  }

  saveFilter() {
    this._oldFilter = Object.assign({}, this.filter);
  }

  rollbackFilter() {
    this._filter = Object.assign({}, this._oldFilter)
  }

  @computed get isChangedFilter() {
    let isChanged = false;
    for (let [k, v] of Object.entries(this.filter)) {
      if (Array.isArray(v)) {
        isChanged = v.length !== this._oldFilter[k].length || !!_.difference(v, this._oldFilter[k]).length
      } else {
        isChanged = !_.isEqual(v, this._oldFilter[k])
      }
      if (isChanged) break
    }
    return isChanged;
  }

  @action clearOrderBy() {
    let filter = Object.assign({}, filter)
    filter.order_by = null;
  }

  @action activateSort(name) {
    let activeSort = Object.assign({}, this.activeSort)
    if (!activeSort[name]) {
      activeSort[name] = 'desc'
    } else if (activeSort[name] === 'asc') {
        activeSort[name] = false
    } else {
      activeSort[name] = 'asc'
    }
    this.activeSort = activeSort
  }

  @action clearFilter() {
    this._filter = {
      datefrom: null,
      dateto: null,
      order_by: null,
      keywords: "",
      regions: [],
      work_groups: [],
      monitoring_shops: [],
      monitoring_types: [],
    }
  }

  @action changeFilter({
    datefrom = this.filter['datefrom'],
    dateto = this.filter['dateto'],
    order_by = this.filter['order_by'],
    keywords,
    regions = this.filter['regions'],
    work_groups = this.filter['work_groups'],
    monitoring_shops = this.filter['monitoring_shops'],
    monitoring_types = this.filter['monitoring_types']
  }) {
    this._filter = Object.assign(
      {},
      this._filter,
      {
        datefrom, 
        dateto,
        order_by,
        keywords,
        regions, 
        work_groups, 
        monitoring_shops,
        monitoring_types
      },
    )
  }

  @action setCompleteWares(data) {
    this.completeWares = data;
  }

  @action setPaginate(paginate) {
    this.paginate = Paginate.create(paginate)
    console.log(this.paginate)
  }
  
  getCompleteWares(page = 1) {
    const order_by = Object.entries(this.activeSort)
    .filter(([name, sort]) => sort)
    .map(([name, sort]) => sort === 'desc' ? `-${name}`: name)
    .join(",")
    return new Promise((resolve, reject) => {
      this.api.getCompleteWares({page, order_by, ...this.filter}).then(
        ({paginate, result}) => {
          this.setCompleteWares(result)
          this.setPaginate(paginate)
          this.saveFilter()
          resolve()
        }, reject
      )
    })
  }

  _getFilterFields(name, clb) {
    return new Promise((resolve, reject) => {
      this.api.allContentTypes({
        content_type_name: name,
        short: true, 
        page_size: 250
      }).then(data => {
        try {
          clb(data)
          resolve()
        } catch(e) {
          reject(e)
        }
      }, e => console.error("getFields", e))
    })
  }

  getFilterFields(name) {
    if (!this[name].length) {
      this._getFilterFields(name, ({result}) => {
        runInAction(() => this[name] = result || [])
      })
    }
  }

}

export default new CompleteWaresStore();