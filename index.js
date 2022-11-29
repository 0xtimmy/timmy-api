addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const corsHeaders = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET POST',
  'Access-Control-Allow-Origin': '*',
}

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Respose('OK', {
      headers: corsHeaders,
    })
  } else if (request.method === 'GET') {
    const value = await HELLOS.get('num')
    return new Response(`${value}`, { status: 200, headers: corsHeaders })
  } else if (request.method == 'POST') {
    const value = await HELLOS.get('num')
    await HELLOS.put('num', parseInt(value) + 1)
    return new Response('Hi !!', { status: 200, headers: corsHeaders })
  }
  return new Response('Empty Endpoint', { status: 404, headers: corsHeaders })
}
