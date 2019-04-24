import { observable, action, runInAction } from 'mobx';
import _ from "lodash";
import Api from '../api/api'
import ContentType from './models/ContentType';
import Paginate from './models/Paginate';
import { TextField, PhoneField, EmailField } from '../helpers/fields';

class ContentTypesStore {

  api = new Api()
  @observable all = []
  @observable name
  @observable plural
  @observable paginate = {}
  @observable page = 1

  getAll({page = this.page, content_type_name = null, content_type_id = null}) {
    this.clear()
    this.page = page
    return new Promise(resolve => {
      this.api.allContentTypes({page, content_type_name, content_type_id})
      .then(contentTypes => {
        runInAction(() => {
          this.name = contentTypes.meta.name
          this.plural = contentTypes.meta.plural
          contentTypes.paginate && (this.paginate = Paginate.create(contentTypes.paginate))
          contentTypes.result && (this.all = contentTypes.result.map(v => ContentType.create({...v, ...contentTypes.meta})))
        })
        resolve()
      })
    })
  }

  sendData(content_type_id, fields) {
    return new Promise(resolve => {
      this.api.sendFieldsContentType(content_type_id, fields).then(ans => {
        console.log('sendFieldsContentType',ans)
        resolve()
      })
    })
  }

  select({id, content_type_id}) {
    return new Promise((resolve, reject) => {
      this.api.getFieldsContentType({id, content_type_id})
      .then(
        contentType => {
          let fields = {}
          for (let { disabled, type, value, name, required, label } of contentType.fields) {
            switch (type) {
              case 'string':
              case 'text':
              case 'number':
              case 'date':
                let field = TextField
                if (name === 'phone') {
                  field = PhoneField
                } else if (name === "email") {
                  field = EmailField
                }
                fields[name] = field({
                  disabled: !!id && disabled, 
                  type: type == 'text'? 'textarea': 'input',
                  label,
                  value,
                  required,
                })
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
            }
          }
          resolve({title: contentType.meta.title, fields})
        },
        reject
      )
    })
  }

  @action clear() {
    this.all = []
    // this.name = null
    // this.plural = null
  }

}

export default new ContentTypesStore();