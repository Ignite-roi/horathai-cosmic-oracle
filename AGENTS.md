<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Blog content lives in `blog_posts`; writes only via `/api/public/blog-ingest` (AUTOPILOT_SECRET, constant-time) or admin server fns using the service role — keeps public RLS read-only for published posts.
- `/sitemap.xml` is a server route merging `INDEXABLE_STATIC_PATHS` with published posts; `SITE_URL` lives in `src/lib/seo.ts` (re-exported from `blog.functions.ts`) — single source for canonical/sitemap host.
- SEO follows the SEO Operating System: read `docs/seo/README.md` before touching public pages, metadata, the sitemap, or the blog autopilot. Public pages use `pageHead()` from `src/lib/seo.ts`; app screens stay `noindex`; never put `/chart`, `/transit`, `/ai` aliases in the sitemap or links; only VERIFIED facts from `docs/seo/BUSINESS_FACTS.md` in content/schema; log changes in `docs/seo/SEO_CHANGE_LOG.md`.
