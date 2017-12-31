/*
  TODO: Create log levels (log, error, etc) so some can be off, some can be on
*/
export default function (...output) {
  if (false) { // TODO: `if (isDebugMode)`
    console.log(...output)
  }
}