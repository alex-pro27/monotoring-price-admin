import { observable, action, runInAction } from 'mobx';
import _ from "lodash";
import Api from '../api/api'
import ContentType from './models/ContentType';
import Paginate from './models/Paginate';
import { TextField, PhoneField, EmailField } from '../helpers/fields';
import moment from 'moment';

class ContentTypesStore {

  api = new Api()
  @observable all = []
  @observable name
  @observable plural
  @observable paginate = {}
  @observable page = 1
  @observable keyword
  @observable sortFields = []
  @observable extraFields = []
  @observable short = true
  @observable activeSort = {}
  @observable orderBy
  @observable availableSearch = false
  contentTypeID
  toHTML

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

  getAll({
    page,
    keyword,
    content_type_name, 
    content_type_id,
    short = false,
    order_by,
    group_by,
  }) {
    this.clear(content_type_id)
    page = page || this.page
    keyword = keyword === "" ? keyword : keyword || this.keyword
    order_by = order_by || this.orderBy
    this.page = page
    this.keyword = keyword
    this.orderBy = order_by
    return new Promise(resolve => {
      this.getList({
        page,
        keyword,
        content_type_name, 
        content_type_id,
        short,
        order_by,
        group_by
      }).then(contentType => {
        runInAction(() => {
          this.name = contentType.meta.name
          this.plural = contentType.meta.plural
          this.short = contentType.meta.short
          this.availableSearch = contentType.meta.available_search
          this.toHTML = contentType.meta.toHTML
          contentType.paginate && (this.paginate = Paginate.create(contentType.paginate))
          if (contentType.meta.short) {
            contentType.result && (this.all = contentType.result.map(v => ContentType.create({...v, ...contentType.meta})))
          } else {
            contentType.result && (this.all = contentType.result)
            this.sortFields = contentType.sort_fields || []
            this.extraFields = contentType.extra_fields || []
          }
          resolve()
        })
      })
    })
  }

  getList({
    page = 1, 
    content_type_name, 
    content_type_id,
    keyword,
    short = true,
    order_by,
    group_by,
  }) {
    return this.api.allContentTypes({
      page, 
      content_type_name, 
      content_type_id,
      keyword,
      short,
      order_by,
      group_by
    })
  }

  sendData(content_type_id, fields) {
    return this.api.sendFieldsContentType(content_type_id, fields)
  }

  select({id, content_type_id}) {
    return new Promise((resolve, reject) => {
      this.api.getFieldsContentType({id, content_type_id})
      .then(
        contentType => {
          let fields = {}
          for (let { disabled, type, value, name, required, label, content_type, group_by, options } of contentType.fields) {
            switch (type) {
              case 'string':
              case 'text':
              case 'number':
              case 'datetime-local':
              case 'date':
              case 'password':
              case 'array':
                let field = TextField
                if (name === 'phone') {
                  field = PhoneField
                } else if (name === "email") {
                  field = EmailField
                }
                fields[name] = field({
                  disabled: !!id && disabled, 
                  type,
                  label,
                  value,
                  required,
                })
                if (['datetime-local', "date"].indexOf(type) > -1) {
                  fields[name].convert = (datetime) => moment(datetime).format("YYYY-MM-DDThh:mm:ss")
                }
                break;
              case 'switch':
              case 'checkbox':
                fields[name] = {
                  label,
                  value,
                  type,
                  disabled,
                }
                break;
              case 'hidden':
                fields[name] = {
                  value, name, type
                }
                break;
              case 'has_many':
              case 'many_to_many':
                fields[name] = {
                  label,
                  value: value || [],
                  name,
                  contentType: content_type,
                  type: 'multy_select',
                  groupBy: group_by,
                  groups: contentType.groups,
                  convert: items => items.map(({value}) => value),
                }
                break;
              case 'belongs_to':
                fields[name + "_id"] = {
                  label,
                  width: '80%',
                  value,
                  name: name + "_id",
                  contentType: content_type,
                  type: 'search_select',
                  convert: (value) => value.value,
                }
                break
                case 'choice':
                  fields[name] = {
                    label,
                    width: '80%',
                    value,
                    name,
                    options,
                    type: 'select',
                    convert: (value) => value.value,
                  }
                break
            }
          }
          resolve({title: contentType.meta.title, fields})
        },
        reject
      )
    })
  }

  @action clearOrderBy() {
    this.orderBy = null
  }

  @action clear(contentTypeID) {
    this.all = []
    if (this.contentTypeID !== contentTypeID) {
      this.sortFields = []
      this.page = 1
      this.orderBy = null
      this.activeSort = {}
      this.keyword = null
      this.name = null
      this.plural = null
      this.availableSearch = false
      this.contentTypeID = contentTypeID
    }
  }

}

export default new ContentTypesStore();