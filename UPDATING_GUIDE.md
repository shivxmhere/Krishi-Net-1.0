# 🚀 How to Update Krishi-Net

Since your app is connected to **Render (Backend)** and **Vercel (Frontend)**, updates are **AUTOMATIC**. You just need to push your code.

## 1. Make Changes Locally
- Open VS Code.
- Edit files (e.g., change colors in `index.css` or text in `App.tsx`).
- Test it: `npm run dev`.

## 2. Save & Deploy (The Magic Step)
When you are happy with your changes, run these 3 commands in the terminal:

```bash
git add .
git commit -m "Describe your change here"
git push
```

## 3. Watch it Go Live 🟢
- **GitHub** receives your code.
- **Render** sees the change and re-builds the Backend (if you touched Python code).
- **Vercel** sees the change and re-builds the Frontend (if you touched React code).
- **PWA Users** (Code on phone) will receive an update notification next time they open the app!

## 💡 Best Practices
- **Small Changes**: Commit often. Don't wait for huge changes.
- **Test First**: Always check `localhost:5173` before pushing.
- **Check Status**: If something breaks, check Vercel/Render dashboards logs.
