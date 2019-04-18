import { observable, action, runInAction } from 'mobx';
import _ from "lodash";
import Api from '../api/api'
import User from './models/User';
import Paginate from './models/Paginate';

class UsersStore {

  api = new Api();
  @observable paginate = {}
  @observable users = []
  @observable selectedUser = {}

  getUsers(page = this.paginate.current_page) {
    return new Promise((resolve, reject) => {
      this.api.allUsers(page).then(
        (ans) => ans && runInAction(
          () => {
            const { paginate, result } = ans
            this.users = result.map(user => User.create(user))
            this.paginate = Paginate.create(paginate)
            resolve()
          }
        ) || reject()
      )
    })
  }

  selectUser(id) {
    return new Promise((resolve, reject) => {
      this.api.getUserInfo(id).then(
        user => {
          runInAction(() => this.selectedUser = User.create(user))
          resolve()
        },
        reject
      )
    })
  }

  @action clearSelectedUser() {
    this.selectedUser = {}
  }

  @action clear() {
    this.users = []
    this.paginate = {}
    this.selectedUser = {}
  }

}

export default new UsersStore();