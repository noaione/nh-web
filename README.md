# NextJS Template

This is a simple template that I'll use to generate new NextJS project easily without needing to copy paste stuff from other projects of mine.

Using:
- 🎨 Tailwind CSS + PostCSS with some plugin
- 💪 Strong typing support with **TypeScript**
- 💻 Linting support with **ESLint** + **Prettier** for making the code much more beautiful

The template is setup so you can just start working without needing to worry much about your setup.

**PostCSS are configured**:<br />
Default NextJS config with:
- CSS Nesting support
- CSS import support
- CSS minifier with cssnano

**Tailwind are configured**:<br />
- JIT mode
- Purging on `componenets`, `lib`, and `pages`
- Using class for dark mode (meaning changing the html class)
- Using a True Gray version for Gray color
- No extra plugins setup, you do it yourself.

This project is bootstrapped with yarn, but you can use other package manager. The reason why I use yarn is because vercel deployment support.

## Starting
1. Use this template when creating new repository
2. Clone it
3. Run `yarn install` to install everything
4. Start coding!

## License
This template is licensed with MIT License, you can change it to whatever you want.
