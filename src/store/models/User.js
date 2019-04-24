import { observable } from 'mobx';

class User {
  
  id
  @observable first_name
  @observable last_name
  @observable phone
  @observable online

  get fullName() {
    return `${this.last_name} ${this.first_name}`
  }

  static create({id, first_name, last_name, phone, online}) {
    let user = new User();
    [
      user.id,
      user.first_name,
      user.last_name,
      user.phone,
      user.online
    ] = [
      id,
      first_name,
      last_name,
      phone,
      online
    ]
    return user;
  }
}

export default User;