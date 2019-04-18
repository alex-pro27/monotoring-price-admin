
export function TextField({
  label, 
  value = '', 
  required = true, 
  width = "100%",
  disabled = false, 
  error = '', 
  changed = false,
  maxLength = 50,
  placeHolder = '',
  type = "input",
  onChange,
  getError = value => changed && required ? !!value && 'Заполните это поле' : '',
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
    getError,
  }, {
    placeHolder: {
      get: () => placeHolder
    },
    label: {
      get: () => label 
    },
    value: {
      get: () => value,
      set: newValue => {
        changed = true
        if (
          newValue && typeof transform === 'function'
          && ((oldValue && oldValue.toString().substr(0, value.length - 1) !== newValue)
          || !value)
        ) {
          value = typeof transform === 'function' ? transform(newValue) : value
        }
        typeof onChange === 'function' && onChange(value)
        typeof getError === 'function' && (error = getError(value))
      }
    }
  })
}

export function PhoneField({
  label, 
  value = '', 
  required = false, 
  width = "100%",
  disabled = false, 
  error = '', 
  changed = false,
  onChange,
}) {
  return TextField({
    label,
    value, 
    required, 
    width,
    disabled, 
    error, 
    changed,
    type: "phone",
    onChange,
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
    getError: value => {
      if (required) {
        if (!!value) {
          return 'Заполните это поле'
        }
      }
      if (!!value) {
        if (!value.match(/\+7-\d{3}-\d{3}-\d{2}-\d{2}/)) {
          return "Неверно заполнено поле"
        }
      }
      return ''
    },
  })
}
