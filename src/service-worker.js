/**
 * WARNING:
 * If you modify this file, it wouldn't hot reload.
 * YOU'LL MAY NEED TO UPDATE SERVICE WORKER IN THE CHROME DEBUGGER
 * Debugger => Application tab => Service Worker sidenav => Update "link"
 * Search for "Chrome debugger how to update service worker"
 *
 * It is also GENERIC javascript without any imports (easier to maintain).
 * So DO NOT GET FANCY
 * **/

try {
  const CACHE_NAME = "mdedit-cache-v1";

  self.addEventListener("install", async () => {
    console.log("installing!");
    await self.skipWaiting();
  });

  self.addEventListener("activate", async () => {
    console.log("activating!");
    await self.skipWaiting();
  });

  /**
   * We follow the "stale-while-revalidate" pattern:
   * respond with the cached response immediately (if we have one)
   * even though this might be "stale" (not the most recent version).
   * In the background fetch the latest version and put that into cache
   * on next request the user will get the latest version
   * @param request {Request}
   * @returns {Promise<Response>}
   */
  const get_response = async (request) => {
    const cache = await self.caches.open(CACHE_NAME);
    const url = new URL(request.url);
    {
      const cached_response = await cache.match(url.pathname);
      if (cached_response) {
        console.log(`found "${url.pathname}" in cache returning response`, cached_response);
        return cached_response;
      }
    }

    // fallback to just the filename in /mdedit/img/ directory
    {
      const filename = `/mdedit/img/${url.pathname.split("/").pop() ?? "missing.jpg"}`
      const cached_response = await cache.match(filename);
      if (cached_response) {
        console.log(`found filename "${filename}" in cache returning response`, cached_response);
        return cached_response;
      }
    }

    // fallback to just the filename
    {
      const filename = url.pathname.split("/").pop();
      const cached_response = await cache.match(filename);
      if (cached_response) {
        console.log(`found filename "${filename}" in cache returning response`, cached_response);
        return cached_response;
      }
    }

    // fallback to usds site
    if (url.pathname.indexOf("-img/") > -1) {
      // get the pathname without all the site specific urls.
      // This is a horrible approach because it hardcodes the path
      const normalizedPath = url.pathname
        .replace("/news-and-blog/", "/") // we add it back in below
        .replace("/website-content-editor/","/");
      const newRequestUrl = `https://usds.github.io/website-staging/news-and-blog${normalizedPath}`;

      console.log(`found possible news-and-blog in path, so checking staging server for "${newRequestUrl}"`);
      // Important: no await here, since that that would block
      return fetch(newRequestUrl).then((response) => {
        if (response.status !== 200 ||
          !(response.headers.get('Content-Type') ?? "").startsWith("image")) {
          console.warn(`cache: expected image type response, 
            but it wasn't probably a 404 when trying to load it from staging. (${response.status})`, response);
          return; // ignore
        }
        const filename= url.pathname.split("/").pop();
        const suffix = filename.split(".").pop();
        if (["jpg", "jpeg", "png"].includes(suffix)) {
          // save images back into the cache, this will allow them to be downloaded/saved back out.
          console.log(`cache miss for "${newRequestUrl}" fetched and put into cache as "/mdedit/img/${filename}"`);
          void cache.put(`/mdedit/img/${filename}`, response.clone()); // don't await
        }
        return response;
      });
    }

    return fetch(request);
    // // could return a default "broken" image?
    // console.warn("cached image not found. request", request);
    // return new Response("Network error happened", {
    //   status: 404,
    //   headers: { "Content-Type": "text/plain" },
    // })
  };

  /**
   * Listen for browser fetch events.
   * These fire any time the browser tries to load anything.
   * This isn't just fetch() calls; clicking a <a href> triggers it too.
   */
  self.addEventListener("fetch", (event /** @type {FetchEvent} */) => {
    // console.log(`Fetch event for "${event.request.url || ''}"`);
    event.respondWith(get_response(event.request));
  });

} catch(err) {
  console.error(err);
}
