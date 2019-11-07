import { observable } from 'mobx';
import { persist } from 'mobx-persist';
import Role from './Role';
import Monitoring from './Monitoring';

class Admin {
  
  @persist id
  @persist @observable first_name
  @persist @observable last_name
  @persist @observable token
  @persist @observable is_super_user
  @persist @observable email
  @persist("list", Role) roles
  @persist("list", Monitoring) monitorings

  static create({
    id, 
    first_name, 
    last_name, 
    token,
    email,
    monitorings = [], 
    roles = [], 
    is_super_user
  }) {
    let admin = new Admin();
    [
      admin.id,
      admin.first_name,
      admin.last_name,
      admin.token,
      admin.roles,
      admin.is_super_user,
      admin.monitorings,
      admin.email
    ] = [
      id,
      first_name,
      last_name,
      token,
      roles.map(x => Role.create(x)),
      is_super_user,
      monitorings.map(x => Monitoring.create(x)),
      email
    ]
    admin.fullName = `${first_name} ${last_name}`
    return admin;
  }
}

export default Admin;