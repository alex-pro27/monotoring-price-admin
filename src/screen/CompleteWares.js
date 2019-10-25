import React, { Component, useState, useEffect } from 'react';
import ReactDOM from 'react-dom'
import { observer, inject } from 'mobx-react';
import { observe } from 'mobx';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import ListItemText from '@material-ui/core/ListItemText';
import Spinner from '../components/Spinner';
import PaginateComponent from '../components/Paginate';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Lightbox from 'react-image-lightbox';
import Select from '@material-ui/core/Select';
import Input from '@material-ui/core/Input';
import Chip from '@material-ui/core/Chip';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import TextField from '@material-ui/core/TextField';
import AppWrapper from '../components/AppWrapper';
import SearchInput from '../components/SearchInput';
import moment from 'moment';
import { SERVER_ROOT } from '../constants/config';
import { Box } from '@material-ui/core';
import roleTypes from '../constants/roles'

const useFilterStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 400,
    maxWidth: 600,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    maxWidth: 200,
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 450,
    },
  },
};

const AllowFilters = ({allowFiltres, completeWaresStore}) => {
  const classes = useFilterStyles();
  // const theme = useTheme();
  const fields = Object.entries(allowFiltres).map(([key, label], i) => {
    const [val, setVal] = useState(completeWaresStore.filter[key]);
    const [list, setList] = useState(completeWaresStore[key]);
    const handleChange = ({target:{ value }}) => {
      setVal(value);
      completeWaresStore.changeFilter({[key]: value});
      console.log(completeWaresStore.filter)
    };
    useEffect(
      () => observe(
        completeWaresStore,
        key, ({ newValue }) => setList(newValue)
      ),
      []
    )
    completeWaresStore.getFilterFields(key)
    return (
      <Box key={key}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="select-multiple-chip">{label}</InputLabel>
          <Select
            multiple
            value={val}
            onChange={handleChange}
            input={<Input id="select-multiple-chip" />}
            renderValue={selected => (
              <div className={classes.chips}>
                {
                  selected.map(value => {
                    const item = completeWaresStore[key].find(x => x.value === value)
                    return item && <Chip key={value} label={item.label} className={classes.chip} />
                  })
                }
              </div>
            )}
            MenuProps={MenuProps}
          >
            {
              list.map(({value, label}) => {
                const el = val.find(x => x === value)
                return (
                  <MenuItem key={value} value={value}>
                    <Checkbox checked={!!el} />
                    <ListItemText primary={label} />
                  </MenuItem>
                )
              })
            }
          </Select>
        </FormControl>
      </Box>
    )
  })

  const dateFields = Object.entries({
    'datefrom': 'Дата начала', 'dateto': 'Дата окончания'
  }).map(([key, label]) => {
    const onChangeDate = ({target: {value}}) => {
      completeWaresStore.changeFilter({[key]: value});
    }
    return (
      <TextField
        key={key}
        id={key}
        label={label}
        type="date"
        defaultValue={completeWaresStore.filter[key]}
        className={classes.textField}
        onChange={onChangeDate}
        InputLabelProps={{
          shrink: true,
        }}
      />
    )
  })

  return (
    <Box>
      <Spinner listenLoad={['allContentTypes']} />
      {dateFields}
      {fields}
    </Box>
  )
}

const styles = theme => ({
  
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflow: 'hidden'
  },

  list: {
    width: '100%',
    overflow: 'auto',
  },
  controlBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '10px 15px',
    width: '100%'
  },
  tableWarapper: {
    overflow: 'auto',
    marginTop: 25,
  },
  tableHead: {
    backgroundColor: theme.palette.grey['200']
  },
  tableRow: {
    cursor: 'pointer',
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },
  },
  tableCell: {
    minHeight: "48px",
    textAlign: 'left',
    padding: "12px 15px"
  },
  disabledSort: {
    color: theme.palette.text.disabled,
  },
})

@AppWrapper
@withStyles(styles)
@inject('completeWaresStore', 'appStore')
@observer
class CompleteWares extends Component {

  disposers = [];

  state = {
    isOpen: false,
    showImage: null,
  }

  header = {
    photos: ["Фотографии", false],
    code: ["Код товара", true],
    ware: ["Товар", true],
    segment_code: ["Код сегмента", true],
    segment: ["Сегмент", true],
    region: ["Регион", true],
    work_group: ["Рабочая группа", true],
    user_name: ["Пользователь", true],
    date_upload: ["Дата выгрузки", true],
    missing: ["Отсутвует", true],
    price: ["Цена", true],
    monitoring_type: ["Тип мониторига", true],
    rival_code: ["Код конкурента", true],
    rival: ["Конкурент", true],
  }

  onUpdateSignal = () => {
    this.props.completeWaresStore.getCompleteWares()
  }

  handlerValues = (name, value) => {
    const handlers = {
      date_upload: date => moment(date).format("LLL"),
      missing: value => value ? "Да" : "Нет",
      photos: photos => (
        photos && photos.length && photos.map(
          (path, i) => (
            <img
              key={i}
              src={SERVER_ROOT + path.replace(/(.*)\.(jpe?g|png|gif)/ig, '$1_thumb.$2')} 
              alt='' 
              onClick={this.onClickImg}
              style={{width: 100, height: 100}}
            />
          )
        )
      ),
    }
    return (handlers[name] && handlers[name](value)) || value;
  }

  componentDidMount() {
    this.props.completeWaresStore.getCompleteWares()
    this.disposers = [
      observe(this.props.completeWaresStore, 'activeSort', ({ newValue }) => {
        const order_by = Object.entries(newValue)
        .filter(([name, sort]) => sort)
        .map(([name, sort]) => sort === 'desc' ? `-${name}`: name)
        .join(",")
        this.props.completeWaresStore.changeFilter({order_by})
        this.props.completeWaresStore.getCompleteWares()
      }),
    ]
    this.onResize = () => this.forceUpdate()
    window.addEventListener("resize", this.onResize)
  }

  componentWillUnmount() {
    this.disposers.forEach(d => d())
    window.removeEventListener("resize", this.onResize)
  }

  sortHandler = name => event => {
    this.props.completeWaresStore.activateSort(name);
  }

  onScrollTable = ({ target }) =>  {
    let thead = ReactDOM.findDOMNode(this.refs.thead)
    thead.style.transform = "translate(0," + target.scrollTop + "px)";
  }

  onSearch = keywords => {
    this.props.completeWaresStore.changeFilter({ keywords })
    this.props.completeWaresStore.getCompleteWares()
  }

  openFilter = () => {
    let filters = {
      monitoring_shops: "Магазины для мониторига(Конкуренты)",
      monitoring_types: "Типы мониторига",
    }
    const { roles } = this.props.appStore.admin;
    if (roles && roles.find(x => roleTypes.ADMIN === x.role_type)) {
      filters = {
        regions: "Регионы",
        work_groups: "Рабочие группы",
        ...filters, 
      }
    }
    window.showDialog({
      title: "Доступные фильтры",
      node: <AllowFilters 
              allowFiltres={filters}
              completeWaresStore={this.props.completeWaresStore} 
            />,
      yes: "Применить",
      no: "Отмена",
      onAction: (ans) => {
        if (ans) {
          if (this.props.completeWaresStore.isChangedFilter) {
            this.props.completeWaresStore.getCompleteWares();
          }
        } else {
          this.props.completeWaresStore.rollbackFilter();
        }
      },
    })
  }

  onClickImg = (event) => {
    event.stopPropagation()
    if (event.target.src) {
      this.setState({
        isOpen: true,
        showImage: event.target.src.replace(/(.*)_thumb\.(jpe?g|png|gif)/g, "$1.$2")
      })
    }
  }
  
  render() {
    const { 
      classes, 
      history,
      match: { path },
      completeWaresStore: {
        activeSort,
        completeWares,
        paginate,
        keyword,
        isCheckedFilter
      }
    } = this.props

    return (
      <Box className={classes.wrapper} style={{height: window.innerHeight - 64}}>
        <Spinner listenLoad={['getCompleteWares',]} />
        {
          this.state.isOpen && (
            <Lightbox
              mainSrc={this.state.showImage}
              onCloseRequest={() => this.setState({ isOpen: false })}
            />
          )
        }
        <Box className={classes.controlBlock}>
          <Box>
            <IconButton color={isCheckedFilter ? 'secondary': 'default'} onClick={this.openFilter}>
              <Icon>filter_list</Icon>
            </IconButton>
          </Box>
          <Box style={{margin: "auto 15px"}}>
            <SearchInput
              keyword={keyword}
              onSearch={this.onSearch}
              placeHolder={`Искать ${name}`} 
            />
          </Box>
        </Box>
        <PaginateComponent 
          paginate={paginate}
          maxPages={9}
          getContent={page => {
            this.props.completeWaresStore
            .getCompleteWares(page)
            .then(() => {
              if (this.refs["table"]) {
                const table = ReactDOM.findDOMNode(this.refs["table"])
                table && table.scrollTo(0, 0)
              }
            })
          }}
        />
        
        <Paper 
          onScroll={this.onScrollTable} 
          elevation={0} 
          className={classes.tableWarapper}
          style={{width: window.innerWidth - 73}}
          ref="table"
        >
          <Table>
            <TableHead ref={"thead"} className={classes.tableHead}>
              <TableRow>
              {
                Object.entries(this.header).map(([name, [label, isSort]], i) => (
                  <TableCell key={i} className={classes.tableCell}>
                    {
                      isSort
                      ? (
                          <TableSortLabel
                            active={!!activeSort[name]}
                            direction={activeSort[name] || 'asc'}
                            onClick={this.sortHandler(name)}
                          >
                            <Typography variant={"body2"}>{label}</Typography>
                          </TableSortLabel>
                        )
                      : <Typography className={classes.disabledSort} variant={"body2"}>{label}</Typography>
                    }
                  </TableCell>
                ))
              }
              </TableRow>
            </TableHead>
            <TableBody className={classes.tableBody}>
            {
              completeWares.map((row, index) => (
                <TableRow
                  key={index}
                  onClick={() => history.push(`${path}/${row.id}`)}
                  className={classes.tableRow}>
                  {Object.keys(this.header).map((name, i) => (
                    <TableCell key={i} className={classes.tableCell}>
                      {this.handlerValues(name, row[name])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            }
            </TableBody>
          </Table>
        </Paper>
      </Box>
    );
  }
}

export default CompleteWares; 