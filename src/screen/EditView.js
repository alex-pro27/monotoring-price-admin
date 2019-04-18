import React, { Component, Fragment } from 'react';
import { observer, inject } from 'mobx-react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import Lightbox from 'react-image-lightbox';
import AppWrapper from '../components/AppWrapper';

import 'react-image-lightbox/style.css';
import Spinner from '../components/Spinner';
import Form from '../components/Form';
import { TextField } from '../helpers/fields';


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
})

@AppWrapper
@withStyles(styles)
@inject('viewsStore')
@observer
class EdiView extends Component {

  state = {
    fields: {}
  }

  componentDidMount() {
    const viewID = parseInt(this.props.match.params.id)
    this.props.viewsStore.selectView(viewID).then(() => {
      const fields = {
        name: TextField({
          value: this.props.viewsStore.selectView.name,
          lablel: "Имя"
        })
      }
      console.log(fields)
      this.setState({ fields })
    })
  }

  componentWillUnmount() {
    this.props.viewsStore.clearSelectedView()
  }

  render() {
    const {classes, viewsStore: { views }} = this.props;
    return (
      <Fragment>
        <Form fields={this.state.fields}  />
      </Fragment>
    )
  }
}


export default EdiView;