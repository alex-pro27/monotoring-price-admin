import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import AppWrapper from '../components/AppWrapper';

import 'react-image-lightbox/style.css';
import Spinner from '../components/Spinner';
import Form from '../components/Form';


const styles = theme => ({
  wrapper: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
})

@AppWrapper
@withStyles(styles)
@inject('contentTypesStore', 'appStore')
@observer
class EditContentType extends Component {

  state = {
    fields: {},
    init: false,
    contentTypeID: 0,
  }

  componentDidMount() {
    const id = parseInt(this.props.match.params.id) || 0
    const path = this.props.match.path.replace('/:id', '')
    const contentTypeID = this.props.appStore.avilableViews.get(path).content_type_id
    this.setState({ contentTypeID })
    this.props.contentTypesStore.select({content_type_id: contentTypeID, id}).then(
      ({title, fields}) => {
        title && this.props.setTitle(`Редактировать ${title}`)
        this.setState({fields, init: true})
      }
    )
  }

  sendData = (fields) => {
    console.log('sendData',fields)
    this.props.contentTypesStore.sendData(this.state.contentTypeID, fields)
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.wrapper}>
        <Spinner listenLoad={['etFieldsContentType', 'sendFieldsContentType',]} />
       {
         this.state.init &&
         <Form 
          fields={this.state.fields} 
          onPressButton={this.sendData} 
          onChangeFields={fields => this.setState({fields})} 
        />
       }
      </div>
    )
  }
}


export default EditContentType;