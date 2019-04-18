import { observable } from 'mobx';
import { persist } from 'mobx-persist';

class Admin {
  
  @persist id
  @persist @observable first_name
  @persist @observable last_name
  @persist @observable token
  @persist @observable is_super_user

  get fullName() {
    return `${this.first_name} ${this.last_name}`
  }

  static create({id, first_name, last_name, token, is_super_user}) {
    let admin = new Admin();
    [
      admin.id,
      admin.first_name,
      admin.last_name,
      admin.token,
      admin.is_super_user
    ] = [
      id,
      first_name,
      last_name,
      token,
      is_super_user,
    ]
    return admin;
  }
}

export default Admin;