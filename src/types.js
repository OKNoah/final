import { isEmail } from 'validator'
import t from 'flow-runtime'

const length = (min, max) => (input) => (input.length > max || input.length < min) && (`must be between ${min + ' & ' + max} characters`)
const email = (input) => (!isEmail(input)) && (`should be an email address`)
const arangoId = (input) => (!/^[a-z|A-Z]+\/\d+/g.test(input)) && (`should be an ArangoDB id string`)

/*
  This is an important type because it's needed to join documents. See the tests for database and how `include` is used.
*/
export const CollectionType = t.type('ArangoId', t.refinement(t.string(), arangoId))

export const StringLengthType = (min, max) => t.refinement(t.string(), length(min, max))
export const EmailType = t.refinement(t.string(), email)
