import { observable } from 'mobx';

class User {
  
  id
  @observable first_name
  @observable last_name
  @observable phone

  get fullName() {
    return `${this.last_name} ${this.first_name}`
  }

  static create({id, first_name, last_name, phone}) {
    let user = new User();
    [
      user.id,
      user.first_name,
      user.last_name,
      user.phone
    ] = [
      id,
      first_name,
      last_name,
      phone
    ]
    return user;
  }
}

export default User;