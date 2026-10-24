DEPLOY ON NETLIFY
1. Go to app.netlify.com > Add new site > Deploy manually. Drag the whole "applio" folder in.
   (For functions to work, deploy via GitHub or the Netlify CLI: npm i -g netlify-cli, then: netlify deploy --prod)
2. Site settings > Environment variables > add ANTHROPIC_API_KEY (from console.anthropic.com).
3. Redeploy. Open your site URL and test.
