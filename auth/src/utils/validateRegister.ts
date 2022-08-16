import { FieldError, UsernamePasswordInput } from '../resolvers/types'

export const validateRegister = (options: UsernamePasswordInput): [FieldError] | null => {
  // validate for email
  if (!options.email.includes("@")) {
    return [
      {
        field: "email",
        message: "invalid email",
      },
    ]
  }

  // validate for username
  if (options.username.length <= 2) {
    return [
      {
        field: "username",
        message: "length must be greater than 2",
      },
    ]
  } else if (options.username.includes("@")) {
    return [
      {
        field: "username",
        message: "cannot include an @",
      },
    ]
  }

  // validate for password
  if (options.password.length <= 2) {
    return [
      {
        field: "password",
        message: "length must be greater than 2",
      },
    ]
  }

  return null
}
