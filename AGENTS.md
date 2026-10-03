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
- `/sitemap.xml` is a server route merging static public pages with published posts; base URL is `SITE_URL` in `src/lib/blog.functions.ts` — single source for canonical/sitemap host.
