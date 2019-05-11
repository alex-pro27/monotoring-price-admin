
export function TextField({
  label,
  value = '', 
  required = false, 
  width = "80%",
  disabled = false, 
  error = '', 
  changed = false,
  maxLength = 250,
  placeHolder = '',
  type = "string",
  check = () => "",
  transform = value => value.toString().trim()
}) {
  return Object.defineProperties({
    required,
    width,
    disabled,
    error,
    changed,
    maxLength,
    type,
    check,
    value,
    transform
  }, {
    placeHolder: {
      get: () => placeHolder
    },
    label: {
      get: () => label 
    },
  })
}

export function EmailField({
  label, 
  value = '', 
  required = false, 
  width = "80%",
  disabled = false, 
  error = '', 
  changed = false,
  onChange,
}){
  return TextField({
    label,
    value, 
    required, 
    width,
    disabled, 
    error, 
    changed,
    onChange,
    transform: value => (value || "").toLowerCase(),
    check: value => {
      if (!value.match(/^[\w\d][\w\d-._]{0,100}@[\w\d-_]{1,100}\.[\w\d-_]{1,100}/i)) {
        return "Неверно заполнено поле"
      }
      return ''
    }
  })
}

export function PhoneField({
  label, 
  value = '', 
  required = false, 
  width = "80%",
  disabled = false, 
  error = '', 
  changed = false,
  onChange,
  maxLength=17
}) {
  return TextField({
    label,
    value,
    required, 
    width,
    disabled, 
    
    error, 
    changed,
    onChange,
    maxLength,
    transform: value => {
      if (value.match(/\+7\(\d{3}$/)) return value;
      return (
        '+7' + value
        .replace(/^(\+?(7|8))|[^\d]/g, "")
        .replace(
          /(\d{3})(\d{3})?(\d{2})?(\d{2})?/, 
          (str, $1, $2, $3, $4) => {
            let v = `(${$1})-`;
            $2 && (v += `${$2}-`)
            $3 && (v += `${$3}-`)
            $4 && (v += `${$4}`)
            return v;
          })
      )
    },
    check: value => {
      if (!!value && !value.match(/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/)) {
        return "Неверно заполнено поле"
      }
      return ''
    },
  })
}

export function SelectField({
  label,
  value = '', 
  required = false, 
  width = "80%",
  disabled = false, 
  error = '', 
  changed = false,
  placeHolder = '',
  type = "select",
  options = [],
}) {
  return Object.defineProperties({
    label,
    value, 
    required, 
    width,
    disabled, 
    error, 
    changed,
    placeHolder,
    type,
    options
  })
}
