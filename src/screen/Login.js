import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { observer, inject } from 'mobx-react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';


const styles = theme => ({
  card: {
    width: 375,
    height: 375,
    positon: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto'
  },

  cardcontent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
  },

  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
    float: 'left',
  },
  pos: {
    marginBottom: 12,
  },
  container: {
    width: '100%',
    height: '100vh',
    positon: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },
})

@withStyles(styles)
@inject('appStore')
@observer
class Login extends Component {

  state = {
    fields: {
      username: {
        value: null, 
        error: false, 
        changed: false,
        required: true, 
        type: 'text',
        label: 'Логин',
      },
      password: {
        value: null, 
        error: false, 
        changed: false, 
        required: true, 
        type: 'password',
        label: 'Пароль',
      },
    },
  }

  onChange = name => event => {
    let field = Object.assign({}, this.state.fields[name]);
    let value = event.target.value;
    if (!value && field.required) {
      field.error = true
    }
    else {
      field.error = false
    }
    field.value = value;
    field.changed = true;
    let fields = Object.assign({}, this.state.fields)
    fields[name] = field;
    this.setState({ fields });
  }

  get isError() {
    return Object.values(this.state.fields).some(({error, changed}) => error || !changed)
  }

  auth = () => {
    let authData = {}
    Object.entries(this.state.fields).forEach(([name, field]) => authData[name] = field.value)
    this.props.appStore
    .login(authData)
    .then(() => {
      this.props.history.replace(this.props.appStore.routes[0]['path'])
    })
  }

  render() {
    const { classes } = this.props;

    return (
      <div>
        <form className={classes.container} noValidate autoComplete="off">
          <Card className={classes.card}>
            <CardContent className={classes.cardcontent}>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Введите логин и пароль
              </Typography>
              {
                Object.entries(this.state.fields).map(([name, field], i) => {
                  return (
                    <TextField
                      key={i}
                      id={name}
                      error={field.error}
                      label={
                        <Typography className={classes.title} color="textSecondary" gutterBottom>
                          {field.label}
                        </Typography>
                      }
                      type={field.type}
                      required={field.required}
                      className={classes.textField}
                      margin="normal"
                      onChange={this.onChange(name)}
                    />
                  )
                })
              }
              <CardActions>
                <Button 
                  fullWidth={true}
                  variant="contained"
                  color="secondary"
                  disabled={this.isError} 
                  size="small"
                  onClick={this.auth}
                >
                  Войти
                </Button>
              </CardActions>
            </CardContent>
          </Card>
        </form>
      </div>
    );
  }
}

export default Login;