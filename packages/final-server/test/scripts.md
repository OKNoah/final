# Scripts

Here is a quickie script to test some of the servers. It's works in `fish`, haven't tested other terminals. Just copy any paste in terminal.

```bash
curl -s -X GET --header 'Accept: application/json' 'http://localhost:3001/user/'(random) | node -r @babel/register -e "process.stdin.setEncoding('utf8'); var chunks = ''; process.stdin.on('readable', () => { const chunk = process.stdin.read(); if (chunk !== null) { chunks += chunk }}); process.stdin.on('end', () => { process.stdout.write(JSON.stringify(JSON.parse(chunks), null, 2)) ;});"
```

## Output

```json
{
  "data": {
    "count": 1 // this is the current count for the session, it doesn't increment
  },
  "params": {
    "user": "28759" // this is the number from the curl request url `.../user/1`
  },
  "state": {
    "count": 20 // this will increment up each submission, unless server restarts
  }
}
```
