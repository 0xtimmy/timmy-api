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
    return new Response('OK', {
      headers: corsHeaders,
    })
  } else if (request.method === 'GET') {
    const url = new URL(request.url);
    const passcode = url.searchParams.get('passcode')
    if(passcode == null || passcode != PASSCODE) return new Response("passcode is incorrect", { status: 418, headers: corsHeaders });
    // get an entry return the struct
    const query = url.pathname.split("/")
    if(query.length > 1) {
      if(query[1] == "verify") {
        return new Response("true", { status: 200, headers: corsHeaders });
      }
      if(query[1] == "pages") {
        const res = await ALBUMN_KV.get("albumn");
        const keys = Object.keys(JSON.parse(res));
        return new Response(`${keys.length/4}`, { status: 200, headers: corsHeaders});
      }
      if(query[1] == "page" && query.length > 2) {
        const registry = await ALBUMN_KV.get("albumn");
        const keys = Object.keys(JSON.parse(registry));
        const page = parseInt(query[2]);
        if(page != null) {
          const page_num = parseInt(page);
          const out = []
          for(let i = 0; i < 4; i++) {
            const id = page_num * 4 + i;
            if(id < keys.length) out.push(keys[i])
          }
          return new Response(`${JSON.stringify(out)}`, { status: 200, headers: corsHeaders});
        }
        return new Response("page not specified", { status: 400, headers: corsHeaders});
      }
      if(query[1] == "timestamp") {
        const key = query[2];
        const registry = await ALBUMN_KV.get("albumn");
        return new Response(JSON.stringify(JSON.parse(registry.body)[key]), { status: 200, headers: corsHeaders });
      }
      if(query[1] == "entry" && query.length > 3) {
        const id = query[2];
        if(query[3] == "photo") {
          const res = await ALBUMN_BUCKET.get(`${id}/photo`);
          return new Response(res.body, { status: 200, headers: corsHeaders });
        }
        if(query[3] == "note") {
          const res = await ALBUMN_KV.get(`${id}/note`);
          return new Response(res, { status: 200, headers: corsHeaders });
        }    
      }
    }

    //const object = await env.MY_BUCKET.get(key);
    return new Response(`bad verification request`, { status: 500, headers: corsHeaders });
  } else if (request.method == 'POST') {
    const url = new URL(request.url);
    const passcode = url.searchParams.get('passcode')
    if(passcode == null || passcode != PASSCODE) return new Response("passcode is incorrect", { status: 418, headers: corsHeaders });
    const query = url.pathname.split("/");
    if(query[1] == "entry") {
      const id = query[2];
      if(query.length > 3) {
        if(query[3] == "photo") {
          const key = `${query[2]}/photo`;
          await ALBUMN_BUCKET.put(key, request.body);
          return new Response(`${key} photo uploaded successfully`, { status: 200, headers: corsHeaders });
        }
        if(query[3] == "note") {
          const key = `${query[2]}/note`;
          await ALBUMN_KV.put(key, request.body);
          return new Response(`${key} note uploaded successfully`, { status: 200, headers: corsHeaders });
        }
      } else {
        const res = await ALBUMN_KV.get("albumn");
        const registry =  {
          [id]: (new Date(Date.now())).toDateString(),
          ...JSON.parse(res)
        };
        await ALBUMN_KV.put("albumn", JSON.stringify(registry));
        return new Response(JSON.stringify(registry), { status: 200, headers: corsHeaders });
      }
    }
    return new Response("empty endpoint", { status: 200, headers: corsHeaders })
  }
    
  return new Response('Empty Endpoint', { status: 404, headers: corsHeaders })
}
