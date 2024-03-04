/**
 * WARNING:
 * If you modify this file, it wouldn't hot reload.
 * YOU'LL NEED TO UPDATE SERVICE WORKER IN THE CHROME DEBUGGER
 * Debugger => Application tab => Service Worker sidenav => Unregister "link"
 * Web search for "Chrome debugger how to update service worker"
 *
 * It is also GENERIC javascript without any imports (easier to maintain).
 * So DO NOT GET FANCY
 *
 * The goal is NOT to support offline nor to speed up performance.
 * We use service-worker to:
 * 1. cache image uploaded into the Markdown and then serve it so uploaded
 *    images render correctly in the rich view.
 * 2. automatically download and cache images from our usds staging website
 *    that might be pasted into the markdown as a partial url (e.g. /images/foo.gif)
 *
 * There are still cors issues. Any fully qualified url will likely fail to cache.
 * We should still pass them through, but they won't end up cached.
 *
 * There are LOTS of assumptions/shortcoming like:
 *  - This is being used with our main website and partial urls are hard coded
 *  - There's no cache eviction (yet). Should be some FIFO based on total size.
 *  - There's no staleness check. If it caches an image from staging, then that image
 *    is changed, the old one will live on in our cache.
 * **/

try {
  const CACHE_NAME = "mdedit-cache-v1"; // keep in sync with misc.ts
  let hostname = "localhost"; // overridden on activate

  self.addEventListener("install", async (evt) => {
    console.log(`cache: installing. evt`, evt);
    await self.skipWaiting();
  });

  self.addEventListener("activate", async (evt) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    hostname = new URL(evt?.currentTarget?.serviceWorker?.scriptURL).hostname;
    console.log(`cache: activating: "${hostname}"`);
    await self.skipWaiting();
  });

  /**
   * Localhost will not generate 404s but just returns the SPA by default,
   *    so we check the content type, too
   * @param response {Response}
   * @returns {boolean}
   */
  const is_success_reponse = (response) => {
    return ((response.status === 200) && (response.headers.get('Content-Type') ?? "").startsWith("image"));
  }

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
    if (request.destination !== 'image') {
      // we don't cache non-images
      // console.log(`cache: requests not for image "${request.url}"`, request);
      return fetch(request);
    }

    const url = new URL(request.url);
    if (url.hostname === hostname && ["/", ""].includes(url.pathname)) {
      // don't catch our site images
    }

    const webcache = await self.caches.open(CACHE_NAME);
    const filename = url.pathname.split("/").pop().split("?")[0];
    let newurl; // undefined unless we override below.

    // check some cache locations first (todo: remove dup logic)
    {
      const cached_response = await webcache.match(url.pathname);
      if (cached_response) {
        console.log(`cache: found pathname "${url.pathname}" in cache returning response`, cached_response);
        return cached_response;
      }
    }

    {
      const cached_response = await webcache.match(filename);
      if (cached_response) {
        console.log(`cache: found filename "${filename}" in cache returning response`, cached_response);
        return cached_response;
      }
    }

    {
      const cached_response = await webcache.match(`/mdedit/img/${filename}`);
      if (cached_response) {
        console.log(`cache: found fill filename "/mdedit/img/${filename}" in cache returning response`, cached_response);
        return cached_response;
      }
    }

    console.log(`cache: "${request.url}"`, request, url);

    // "usds.github.io/website-content-editor/" this site on github
    // "localhost:port" this site in dev
    // "usds.github.io/website-staging" usds website staging
    // "usds.gov/" is production website
    // "https://github.com/usds/website/blob/master/images/aileen-chen.jpg" (seen before)
    // others?

    // partial urls that are pasted in from MD can resolve like they are on our site
    // but we want to try and find them and get them in our cache.
    // fallback to usds site


    // a '/images/ is a relative url. The hostnames will match if it's a partial path
    // or if we're deployed to production because both start with https://usds.github.io
    if (!newurl && url.pathname.startsWith("/images/") && (url.hostname === hostname)) {
      // grab it from our staging server instead
      newurl = `https://usds.github.io/website-staging/images/${filename}`;
    }

    // I've seen this on some pages before, it's not correct, but it's there.
    if (!newurl && request.url.startsWith("https://github.com/usds/website/blob/master/images/")) {
      newurl = `https://usds.github.io/website-staging/images/${filename}`;
    }

    if (!newurl && url.pathname.indexOf("-img/") > -1) {
      // get the pathname without all the site specific urls.
      // This is a horrible approach because it hardcodes the path
      const normalizedPath = url.pathname
        .replace("/news-and-blog/", "/") // we add it back in below
        .replace("/website-content-editor/","/");
      newurl = `https://usds.github.io/website-staging/news-and-blog${normalizedPath}`;
      console.log(`cache: found possible news-and-blog in path, so checking staging server for "${url.toString()}"`);
    }

    //
    // if (url.hostname !== hostname) {
    //   // offsite request.
    //   const clone = request.clone();
    //   return fetch(request).then((response) => {
    //     // cache the value before returning it.
    //     if ((response.status === 200) && (response.headers.get('Content-Type') ?? "").startsWith("image")) {
    //       void cache.put(`/mdedit/img/${filename}`, response.clone()); // don't await
    //       return response;
    //     }
    //     });
    // }
    //
    // the news-and-blog post images, they are relative and aways end with this suffix in their path


    // by fetching and caching all image requests, we can pull them out of the cache later
    // if  cors might try to block the fetch.
    const fallbackRequest = request.clone();
    return fetch(newurl ? newurl:request).then((response) => {
      if (!is_success_reponse(response)) {
        console.warn(`cache: fetch failed (${response.status}) for "${newurl ?? request.url}" `, response);
        // fallback to original request without trying to intercept
        return fetch(fallbackRequest);
        // fallback could go here.
        // return new Response("Network error happened", {
        //     status: 404,
        //     headers: response.headers,
        //   })
      }
      void webcache.put(`/mdedit/img/${filename}`, response.clone()); // don't await
      return response;
    });
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
