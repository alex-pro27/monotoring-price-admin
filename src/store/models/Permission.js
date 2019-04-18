import { observable } from 'mobx';
import View from './View';

class Permission {
  
  @observable name
  @observable access
  @observable views = []

  static create({id, name, access, views=[]}) {
    let permission = new Permission();
    [
      permission.name,
      permission.access,
      permission.views,
    ] = [
      name,
      access,
      views.map(v => View.create(v))
    ]
    return permission;
  }
}

export default Permission;