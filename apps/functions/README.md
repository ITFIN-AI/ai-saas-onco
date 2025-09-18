# How to deploy functions

### Pre-conditions
- Firebase CLI
- `firebase login` and selected your account with access to this project


### Deploy to dev env all functions

`firebase use develop`

`firebase deploy --only functions`


### Deploy to dev env only one module

`firebase use develop`

`firebase deploy --only functions:products`

### Deploy to dev env only few modules

`firebase use develop`

`firebase deploy --only functions:products,functions:newsletters`

### Deploy to dev env only one function

`firebase use develop`

`firebase deploy --only functions:products-[function-name-from-module-routes-file]`


# How to set new env

1. Add info about new env into .runtimeconfig.dist.json (as empty string)
2. Use Firebase CLI command `firebase functions:config:set admin.new_variable="1234"`

# How to get all envs for selected project

`firebase use develop`

`firebase functions:config:get`
